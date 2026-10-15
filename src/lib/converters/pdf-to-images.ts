import JSZip from 'jszip';

export interface PDFToImageOptions {
    format: 'png' | 'jpeg';
    scale?: number; // 1.0 (standard 72-96 DPI), 2.0 (high-res 150-200 DPI), 3.0 (300 DPI)
    quality?: number; // 0.1 to 1.0 (for JPEG)
    pageRange?: number[]; // 0-indexed page indices, or empty for all pages
}

export interface RenderedImagePage {
    pageNumber: number; // 1-indexed
    dataUrl: string;
    blob: Blob;
    width: number;
    height: number;
}

export async function convertPdfToImages(
    fileOrBytes: File | Uint8Array,
    options: PDFToImageOptions,
    onProgress?: (current: number, total: number) => void
): Promise<RenderedImagePage[]> {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = fileOrBytes instanceof File 
        ? await fileOrBytes.arrayBuffer() 
        : fileOrBytes.buffer;

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const scale = options.scale || 2.0;
    const format = options.format || 'png';
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = options.quality ?? 0.92;

    const targetPages: number[] = options.pageRange && options.pageRange.length > 0
        ? options.pageRange.map(p => p + 1).filter(p => p >= 1 && p <= numPages)
        : Array.from({ length: numPages }, (_, i) => i + 1);

    const renderedPages: RenderedImagePage[] = [];

    for (let i = 0; i < targetPages.length; i++) {
        const pageNum = targetPages[i];
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to obtain 2D canvas context.');
        }

        // Fill white background for JPEGs
        if (format === 'jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        const dataUrl = canvas.toDataURL(mimeType, quality);
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => (b ? resolve(b) : reject(new Error('Canvas to Blob failed'))),
                mimeType,
                quality
            );
        });

        renderedPages.push({
            pageNumber: pageNum,
            dataUrl,
            blob,
            width: viewport.width,
            height: viewport.height,
        });

        if (onProgress) {
            onProgress(i + 1, targetPages.length);
        }
    }

    return renderedPages;
}

export async function packageImagesAsZip(
    images: RenderedImagePage[],
    baseFilename: string = 'document_pages',
    format: 'png' | 'jpeg' = 'png'
): Promise<Blob> {
    const zip = new JSZip();
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    images.forEach((img) => {
        const paddedNum = String(img.pageNumber).padStart(3, '0');
        zip.file(`${baseFilename}_page_${paddedNum}.${ext}`, img.blob);
    });

    return await zip.generateAsync({ type: 'blob' });
}
