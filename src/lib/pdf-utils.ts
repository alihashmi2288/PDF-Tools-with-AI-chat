import { PDFDocument } from 'pdf-lib';

export async function mergePDFs(pdfBytes: Uint8Array[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfByte of pdfBytes) {
        const pdf = await PDFDocument.load(pdfByte);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
}

export async function splitPDF(pdfBytes: Uint8Array, pageIndices: number[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();

    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return await newPdf.save();
}

export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        const { pdfjs } = await import('react-pdf');
        if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let fullText = "";

        // Limit to first 10 pages for performance/token limits
        const maxPages = Math.min(pdf.numPages, 10);

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("Failed to extract text:", error);
        return "";
    }
}
