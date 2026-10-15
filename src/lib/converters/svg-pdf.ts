/**
 * SVG <-> PDF Converter Utility
 * SVG to PDF: Converts vector SVG files into crisp printable PDFs
 * PDF to SVG: Extracts vector SVG files for each PDF page using pdfjs SVGGraphics
 */
export async function convertSvgToPdf(svgTextOrFile: string | File): Promise<Uint8Array> {
    const { jsPDF } = await import('jspdf');

    const svgContent = typeof svgTextOrFile === 'string'
        ? svgTextOrFile
        : await svgTextOrFile.text();

    // Parse SVG dimensions
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');

    let width = 595.28; // Default A4
    let height = 841.89;

    if (svgEl) {
        const viewBox = svgEl.getAttribute('viewBox');
        if (viewBox) {
            const parts = viewBox.split(/[\s,]+/).map(Number);
            if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                width = parts[2];
                height = parts[3];
            }
        } else {
            const wAttr = parseFloat(svgEl.getAttribute('width') || '');
            const hAttr = parseFloat(svgEl.getAttribute('height') || '');
            if (!isNaN(wAttr) && !isNaN(hAttr)) {
                width = wAttr;
                height = hAttr;
            }
        }
    }

    // Convert SVG to high-res image canvas for reliable embedding
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
    });

    const scale = 2; // Hi-DPI
    const canvas = document.createElement('canvas');
    canvas.width = (img.width || width) * scale;
    canvas.height = (img.height || height) * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    URL.revokeObjectURL(url);

    const isLandscape = width > height;
    const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [width, height],
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);

    const arrayBuffer = pdf.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
}

export async function convertPdfToSvg(file: File | ArrayBuffer): Promise<string[]> {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const data = file instanceof File ? await file.arrayBuffer() : file;
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;
    const svgStrings: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });

        const opList = await page.getOperatorList();
        // @ts-ignore - SVGGraphics is available in pdfjs-dist
        const svgGfx = new (pdfjs as any).SVGGraphics(page.commonObjs, (page as any).objs);
        const svgElement = await svgGfx.getSVG(opList, viewport);

        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svgElement);
        svgStrings.push(svgStr);
    }

    return svgStrings;
}
