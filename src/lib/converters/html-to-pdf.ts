/**
 * HTML to PDF Converter Utility
 * Renders HTML content/code or DOM elements to paginated printable PDF
 */
export interface HtmlToPdfOptions {
    pageSize?: 'a4' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    marginMm?: number;
    scale?: number;
    title?: string;
}

export async function convertHtmlToPdf(
    htmlContent: string,
    options: HtmlToPdfOptions = {}
): Promise<Uint8Array> {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const pageSize = options.pageSize || 'a4';
    const orientation = options.orientation || 'portrait';
    const marginMm = typeof options.marginMm === 'number' ? options.marginMm : 10;
    const scale = options.scale || 2;

    // Create an invisible off-screen iframe/container to render the HTML faithfully
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.width = orientation === 'portrait' ? '800px' : '1100px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#111827';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    container.style.padding = '24px';
    container.style.boxSizing = 'border-box';
    container.innerHTML = htmlContent;

    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            scale,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: pageSize,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (marginMm * 2);
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        let heightLeft = imgHeight;
        let position = marginMm;

        // First page
        pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - marginMm * 2);

        // Subsequent pages if content overflows
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + marginMm;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - marginMm * 2);
        }

        const arrayBuffer = pdf.output('arraybuffer');
        return new Uint8Array(arrayBuffer);
    } finally {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
}
