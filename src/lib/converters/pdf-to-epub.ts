/**
 * PDF to EPUB Converter Utility
 * Converts fixed-layout PDF into a reflowable EPUB 3.0 eBook archive
 */
export async function convertPdfToEpub(
    file: File | ArrayBuffer,
    options: { title?: string; author?: string } = {}
): Promise<Uint8Array> {
    const JSZip = (await import('jszip')).default;
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const data = file instanceof File ? await file.arrayBuffer() : file;
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    const bookTitle = options.title || (file instanceof File ? file.name.replace(/\.[^/.]+$/, '') : 'Converted eBook');
    const author = options.author || 'PDFKit';
    const bookId = 'urn:uuid:' + Math.random().toString(36).substring(2, 15);

    const zip = new JSZip();

    // 1. mimetype (MUST be first file, uncompressed)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // 2. META-INF/container.xml
    zip.file(
        'META-INF/container.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
    );

    // Extract pages to chapter files
    const manifestItems: string[] = [];
    const spineItems: string[] = [];
    const tocItems: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let paragraphs: string[] = [];
        let currentP = '';
        let lastY: number | null = null;

        for (const item of textContent.items as any[]) {
            if ('str' in item) {
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) {
                    if (currentP.trim()) paragraphs.push(currentP.trim());
                    currentP = '';
                }
                currentP += (currentP.length > 0 ? ' ' : '') + item.str;
                lastY = item.transform[5];
            }
        }
        if (currentP.trim()) paragraphs.push(currentP.trim());

        const bodyHtml = paragraphs.map(p => `  <p>${escapeXml(p)}</p>`).join('\n');
        const chapterFileName = `page_${i}.xhtml`;

        const chapterContent = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Page ${i}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; margin: 5%; color: #333; }
    h2 { color: #1a365d; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    p { margin-bottom: 1em; text-align: justify; }
  </style>
</head>
<body>
  <h2>Page ${i}</h2>
${bodyHtml}
</body>
</html>`;

        zip.file(`OEBPS/${chapterFileName}`, chapterContent);
        manifestItems.push(`<item id="page_${i}" href="${chapterFileName}" media-type="application/xhtml+xml"/>`);
        spineItems.push(`<itemref idref="page_${i}"/>`);
        tocItems.push(`
    <navPoint id="nav_${i}" playOrder="${i}">
      <navLabel><text>Page ${i}</text></navLabel>
      <content src="${chapterFileName}"/>
    </navPoint>`);
    }

    // 3. OEBPS/toc.ncx
    const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(bookTitle)}</text></docTitle>
  <navMap>
${tocItems.join('\n')}
  </navMap>
</ncx>`;
    zip.file('OEBPS/toc.ncx', ncxContent);

    // 4. OEBPS/content.opf
    const opfContent = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${manifestItems.join('\n')}
  </manifest>
  <spine toc="ncx">
${spineItems.join('\n')}
  </spine>
</package>`;
    zip.file('OEBPS/content.opf', opfContent);

    const blob = await zip.generateAsync({ type: 'uint8array' });
    return blob;
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
