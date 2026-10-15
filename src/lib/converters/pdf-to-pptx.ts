import pptxgen from 'pptxgenjs';

export async function convertPdfToPptx(
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

    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        // 1. Render page to canvas image for slide background / visual
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // 2. Extract text content for speaker notes / searchable content
        const textContent = await page.getTextContent();
        const textLines = textContent.items.map((it: any) => it.str).filter(Boolean);
        const fullPageText = textLines.join(' ');

        // 3. Add PPTX slide
        const slide = pres.addSlide();
        
        // Add rendered high-res page image centered on slide
        slide.addImage({
            data: dataUrl,
            x: '10%',
            y: '5%',
            w: '80%',
            h: '90%',
            sizing: { type: 'contain', w: 8, h: 5 }
        });

        // Add speaker notes with page text
        if (fullPageText.trim().length > 0) {
            slide.addNotes(`Slide ${pageNum} Extracted Transcript:\n${fullPageText}`);
        }

        if (onProgress) {
            onProgress(pageNum, numPages);
        }
    }

    const pptxBlob = await pres.write({ outputType: 'blob' }) as Blob;
    return pptxBlob;
}
