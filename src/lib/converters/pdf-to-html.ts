/**
 * PDF to HTML Converter Utility
 * Converts PDF pages into a standalone, styled, responsive HTML document
 */
export interface PdfToHtmlOptions {
    title?: string;
    includePageSeparators?: boolean;
    modernTypography?: boolean;
}

export async function convertPdfToHtml(
    file: File | ArrayBuffer,
    options: PdfToHtmlOptions = {}
): Promise<string> {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const data = file instanceof File ? await file.arrayBuffer() : file;
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    const documentTitle = options.title || (file instanceof File ? file.name.replace(/\.[^/.]+$/, '') : 'Converted Document');
    let pagesHtml = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let pageContent = '';
        let currentLine = '';
        let lastY: number | null = null;

        for (const item of textContent.items as any[]) {
            if ('str' in item) {
                const text = item.str;
                const fontSize = item.transform ? Math.round(Math.abs(item.transform[0])) : 12;
                const isHeading = fontSize >= 16;
                const isSubheading = fontSize >= 13 && fontSize < 16;

                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 6) {
                    if (currentLine.trim()) {
                        if (isHeading) {
                            pageContent += `      <h2 class="pdf-heading">${escapeHtml(currentLine.trim())}</h2>\n`;
                        } else if (isSubheading) {
                            pageContent += `      <h3 class="pdf-subheading">${escapeHtml(currentLine.trim())}</h3>\n`;
                        } else {
                            pageContent += `      <p class="pdf-paragraph">${escapeHtml(currentLine.trim())}</p>\n`;
                        }
                    }
                    currentLine = '';
                }

                currentLine += (currentLine.length > 0 ? ' ' : '') + text;
                lastY = item.transform[5];
            }
        }

        if (currentLine.trim()) {
            pageContent += `      <p class="pdf-paragraph">${escapeHtml(currentLine.trim())}</p>\n`;
        }

        pagesHtml += `
    <article class="pdf-page" id="page-${i}">
      <div class="page-badge">Page ${i} of ${pdf.numPages}</div>
${pageContent}
    </article>
`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --primary: #3b82f6;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #090d16;
        --card-bg: #111827;
        --text-main: #f1f5f9;
        --text-muted: #94a3b8;
        --border-color: #1e293b;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      line-height: 1.65;
      padding: 40px 20px;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
    }
    header.doc-header {
      margin-bottom: 32px;
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
    }
    header.doc-header h1 {
      font-size: 1.85rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    header.doc-header p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .pdf-page {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 36px 40px;
      margin-bottom: 28px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    .page-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 16px;
      background: var(--bg-color);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
    }
    .pdf-heading {
      font-size: 1.35rem;
      font-weight: 700;
      margin-top: 18px;
      margin-bottom: 8px;
      color: var(--text-main);
    }
    .pdf-subheading {
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 14px;
      margin-bottom: 6px;
      color: var(--text-main);
    }
    .pdf-paragraph {
      font-size: 0.975rem;
      margin-bottom: 12px;
      color: var(--text-main);
      word-break: break-word;
    }
    @media print {
      body { background: white; color: black; padding: 0; }
      .pdf-page { box-shadow: none; border: none; padding: 0; page-break-after: always; }
      .page-badge { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="doc-header">
      <h1>${escapeHtml(documentTitle)}</h1>
      <p>Exported cleanly from PDF • ${pdf.numPages} Page${pdf.numPages > 1 ? 's' : ''}</p>
    </header>
${pagesHtml}
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
