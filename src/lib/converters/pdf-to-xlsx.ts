import * as XLSX from 'xlsx';

interface TextItemCoord {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export async function convertPdfToXlsx(
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

    const workbook = XLSX.utils.book_new();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        if (!items || items.length === 0) {
            continue;
        }

        const rawTokens: TextItemCoord[] = items
            .filter((it) => it.str && it.str.trim().length > 0)
            .map((it) => {
                const tr = it.transform;
                return {
                    text: it.str.trim(),
                    x: tr[4],
                    y: tr[5],
                    width: it.width || 0,
                    height: it.height || 10,
                };
            });

        // Group tokens into rows by Y coordinate (within 4 points threshold)
        // Sort descending by Y first (top of page down)
        rawTokens.sort((a, b) => b.y - a.y || a.x - b.x);

        const rows: { y: number; tokens: TextItemCoord[] }[] = [];
        for (const token of rawTokens) {
            const existingRow = rows.find(r => Math.abs(r.y - token.y) <= 5);
            if (existingRow) {
                existingRow.tokens.push(token);
            } else {
                rows.push({ y: token.y, tokens: [token] });
            }
        }

        // Sort each row's tokens from left to right (X ascending)
        rows.forEach(r => r.tokens.sort((a, b) => a.x - b.x));

        // Find standard column boundaries across all rows on this page
        // If items are separated by > 15 points, consider them distinct columns
        const sheetData: (string | number)[][] = [];

        for (const r of rows) {
            const rowCells: (string | number)[] = [];
            for (let i = 0; i < r.tokens.length; i++) {
                const tok = r.tokens[i];
                // Check if numeric
                const cleanNum = tok.text.replace(/[\$,]/g, '');
                if (!isNaN(Number(cleanNum)) && cleanNum.trim() !== '') {
                    rowCells.push(Number(cleanNum));
                } else {
                    rowCells.push(tok.text);
                }
            }
            if (rowCells.length > 0) {
                sheetData.push(rowCells);
            }
        }

        if (sheetData.length > 0) {
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
        }

        if (onProgress) {
            onProgress(pageNum, numPages);
        }
    }

    // Fallback if empty
    if (workbook.SheetNames.length === 0) {
        const emptyWs = XLSX.utils.aoa_to_sheet([["No tabular data found in PDF"]]);
        XLSX.utils.book_append_sheet(workbook, emptyWs, "Sheet 1");
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}
