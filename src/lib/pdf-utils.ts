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

export async function convertImagesToPdf(files: File[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;

        try {
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(imageBytes);
            } else if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                // For other formats (webp, etc) we would ideally draw them to a canvas first to convert to PNG
                // But for now, let's skip or try basic embedding if PDF-lib supports it (it mainly supports JPG/PNG)
                // If needed, we can add a canvas conversion step here.
                console.warn(`Unsupported image type for direct embedding: ${file.type}`);
                continue;
            }
        } catch (e) {
            console.error(`Failed to embed image ${file.name}:`, e);
            continue;
        }

        if (image) {
            const { width, height } = image.scale(1);
            // Default to A4 size (approx 595 x 842 points) or fit image if larger?
            // Let's make the page match the image size for best quality, 
            // OR fit image to A4. 
            // Requirement: "Automatically resize images to fit page size while preserving aspect ratio"
            // Let's use A4 as base.

            const A4_WIDTH = 595.28;
            const A4_HEIGHT = 841.89;

            let page;
            let drawWidth = width;
            let drawHeight = height;

            // Determine orientation based on image
            const isLandscape = width > height;
            const pageWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
            const pageHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;

            page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Scale to fit
            const scaleFactor = Math.min(pageWidth / width, pageHeight / height);
            drawWidth = width * scaleFactor;
            drawHeight = height * scaleFactor;

            // Center image
            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            page.drawImage(image, {
                x,
                y,
                width: drawWidth,
                height: drawHeight,
            });
        }
    }

    return await pdfDoc.save();
}
