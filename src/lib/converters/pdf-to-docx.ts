import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface TextBlockItem {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
}

export async function convertPdfToDocx(
    fileOrBytes: File | Uint8Array,
    onProgress?: (current: number, total: number) => void
): Promise<Blob> {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = fileOrBytes instanceof File 
        ? await fileOrBytes.arrayBuffer() 
        : fileOrBytes.buffer;

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const docSections: Paragraph[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        if (!items || items.length === 0) {
            continue;
        }

        // Collect text items with coordinates
        const textBlocks: TextBlockItem[] = items
            .filter((item) => item.str && item.str.trim().length > 0)
            .map((item) => {
                const transform = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
                const fontSize = Math.round(Math.abs(transform[0]) || Math.abs(transform[3]) || 12);
                return {
                    str: item.str,
                    x: transform[4],
                    y: transform[5],
                    width: item.width || 0,
                    height: item.height || fontSize,
                    fontSize,
                    fontName: item.fontName || '',
                };
            });

        // Group by Y coordinate (within tolerance of 4 points) to form lines
        // In PDF coordinates, Y goes from bottom (0) to top, so sort descending by Y
        textBlocks.sort((a, b) => b.y - a.y || a.x - b.x);

        const lines: { y: number; maxFontSize: number; text: string; isBold: boolean }[] = [];
        let currentLineY = -1;
        let currentLineText = '';
        let currentLineMaxFont = 12;
        let currentLineFontName = '';

        for (const block of textBlocks) {
            if (currentLineY === -1 || Math.abs(block.y - currentLineY) > 5) {
                // New line started
                if (currentLineText.trim().length > 0) {
                    const isBold = currentLineFontName.toLowerCase().includes('bold') ||
                        currentLineFontName.toLowerCase().includes('black') ||
                        currentLineFontName.toLowerCase().includes('heavy');
                    lines.push({
                        y: currentLineY,
                        maxFontSize: currentLineMaxFont,
                        text: currentLineText.trim(),
                        isBold,
                    });
                }
                currentLineY = block.y;
                currentLineText = block.str;
                currentLineMaxFont = block.fontSize;
                currentLineFontName = block.fontName;
            } else {
                currentLineText += ' ' + block.str;
                if (block.fontSize > currentLineMaxFont) {
                    currentLineMaxFont = block.fontSize;
                }
            }
        }

        if (currentLineText.trim().length > 0) {
            const isBold = currentLineFontName.toLowerCase().includes('bold') ||
                currentLineFontName.toLowerCase().includes('black') ||
                currentLineFontName.toLowerCase().includes('heavy');
            lines.push({
                y: currentLineY,
                maxFontSize: currentLineMaxFont,
                text: currentLineText.trim(),
                isBold,
            });
        }

        // Convert grouped lines into Docx Paragraphs
        for (const line of lines) {
            const fontPt = Math.max(9, Math.min(32, line.maxFontSize));
            const isHeading = fontPt >= 18;
            const isSubheading = fontPt >= 14 && fontPt < 18;

            let paragraph: Paragraph;

            if (isHeading) {
                paragraph = new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 240, after: 120 },
                    children: [
                        new TextRun({
                            text: line.text,
                            bold: true,
                            size: fontPt * 2, // docx uses half-points (24 = 12pt)
                        }),
                    ],
                });
            } else if (isSubheading) {
                paragraph = new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 180, after: 80 },
                    children: [
                        new TextRun({
                            text: line.text,
                            bold: true,
                            size: fontPt * 2,
                        }),
                    ],
                });
            } else {
                paragraph = new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({
                            text: line.text,
                            bold: line.isBold,
                            size: fontPt * 2,
                        }),
                    ],
                });
            }

            docSections.push(paragraph);
        }

        // Add a soft divider between pages
        if (pageNum < numPages) {
            docSections.push(
                new Paragraph({
                    spacing: { before: 200, after: 200 },
                    children: [
                        new TextRun({
                            text: '--- Page Break ---',
                            italics: true,
                            color: '888888',
                            size: 18,
                        }),
                    ],
                })
            );
        }

        if (onProgress) {
            onProgress(pageNum, numPages);
        }
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: docSections.length > 0 ? docSections : [
                    new Paragraph({
                        children: [new TextRun("Empty Document")],
                    }),
                ],
            },
        ],
    });

    return await Packer.toBlob(doc);
}
