/**
 * PDF to TXT converter utility
 * Extracts full, clean plain-text from all pages with reading stats
 */
export interface ExtractedTextResult {
    fullText: string;
    pageTexts: { pageNumber: number; text: string }[];
    pageCount: number;
    wordCount: number;
    characterCount: number;
    readingTimeMinutes: number;
}

export async function convertPdfToTxt(
    file: File | ArrayBuffer,
    options: {
        includePageDividers?: boolean;
        preserveLineBreaks?: boolean;
    } = { includePageDividers: true, preserveLineBreaks: true }
): Promise<ExtractedTextResult> {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const data = file instanceof File ? await file.arrayBuffer() : file;
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    const pageTexts: { pageNumber: number; text: string }[] = [];
    let combinedText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY: number | null = null;
        let pageStr = '';

        for (const item of textContent.items as any[]) {
            if ('str' in item) {
                // If y changes noticeably, add a line break if preserving line breaks
                if (options.preserveLineBreaks && lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                    pageStr += '\n';
                } else if (pageStr.length > 0 && !pageStr.endsWith('\n') && !pageStr.endsWith(' ')) {
                    pageStr += ' ';
                }
                pageStr += item.str;
                lastY = item.transform[5];
            }
        }

        const cleanedPageStr = pageStr.trim();
        pageTexts.push({ pageNumber: i, text: cleanedPageStr });

        if (options.includePageDividers) {
            combinedText += `--- Page ${i} ---\n\n${cleanedPageStr}\n\n`;
        } else {
            combinedText += `${cleanedPageStr}\n\n`;
        }
    }

    const trimmedFullText = combinedText.trim();
    const words = trimmedFullText ? trimmedFullText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const characterCount = trimmedFullText.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return {
        fullText: trimmedFullText,
        pageTexts,
        pageCount: pdf.numPages,
        wordCount,
        characterCount,
        readingTimeMinutes,
    };
}
