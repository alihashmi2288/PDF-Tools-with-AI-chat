/**
 * PowerPoint (.pptx) to PDF Converter Utility
 * Unpacks slide XML, extracts slide text hierarchy & layouts, and renders landscape PDF slides
 */
export interface SlideData {
    slideNumber: number;
    title: string;
    bullets: string[];
}

export async function convertPptxToPdf(file: File | ArrayBuffer): Promise<Uint8Array> {
    const JSZip = (await import('jszip')).default;
    const { jsPDF } = await import('jspdf');

    const zip = new JSZip();
    const data = file instanceof File ? await file.arrayBuffer() : file;
    const contents = await zip.loadAsync(data);

    // Find all slide XML files: ppt/slides/slide1.xml, slide2.xml ...
    const slideFiles: { num: number; path: string }[] = [];
    contents.forEach((relativePath) => {
        const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
        if (match) {
            slideFiles.push({ num: parseInt(match[1], 10), path: relativePath });
        }
    });

    slideFiles.sort((a, b) => a.num - b.num);

    const slides: SlideData[] = [];

    for (const slideFile of slideFiles) {
        const xmlStr = await contents.file(slideFile.path)?.async('string');
        if (!xmlStr) continue;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

        // Extract paragraphs
        const paragraphs = xmlDoc.getElementsByTagName('a:p');
        const extractedLines: string[] = [];

        for (let p = 0; p < paragraphs.length; p++) {
            const pElem = paragraphs[p];
            const textNodes = pElem.getElementsByTagName('a:t');
            let pText = '';
            for (let t = 0; t < textNodes.length; t++) {
                pText += textNodes[t].textContent || '';
            }
            if (pText.trim()) {
                extractedLines.push(pText.trim());
            }
        }

        const title = extractedLines.length > 0 ? extractedLines[0] : `Slide ${slideFile.num}`;
        const bullets = extractedLines.length > 1 ? extractedLines.slice(1) : [];

        slides.push({
            slideNumber: slideFile.num,
            title,
            bullets,
        });
    }

    if (slides.length === 0) {
        // Fallback for empty PPTX
        slides.push({ slideNumber: 1, title: 'Presentation', bullets: ['No slide content found.'] });
    }

    // Render slides to 16:9 Landscape PDF (297 x 167 mm or 254 x 143 mm)
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [254, 143], // 16:9 Standard widescreen
    });

    slides.forEach((slide, idx) => {
        if (idx > 0) pdf.addPage([254, 143], 'landscape');

        // Dark/Clean Slide Theme
        pdf.setFillColor(250, 250, 252);
        pdf.rect(0, 0, 254, 143, 'F');

        // Header accent line
        pdf.setFillColor(59, 130, 246);
        pdf.rect(18, 14, 8, 8, 'F');

        // Slide title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.setTextColor(17, 24, 39);
        const titleLines = pdf.splitTextToSize(slide.title, 210);
        pdf.text(titleLines, 30, 21);

        const titleHeight = (titleLines.length * 9);
        let currentY = 32 + titleHeight;

        // Slide divider rule
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.line(18, currentY - 5, 236, currentY - 5);

        // Slide body bullets
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(55, 65, 81);

        slide.bullets.forEach((bullet) => {
            if (currentY > 125) return; // Prevent clipping
            // Draw bullet point dot
            pdf.setFillColor(59, 130, 246);
            pdf.circle(22, currentY - 1.5, 1.2, 'F');

            const bulletLines = pdf.splitTextToSize(bullet, 205);
            pdf.text(bulletLines, 27, currentY);
            currentY += (bulletLines.length * 7) + 3;
        });

        // Footer slide number
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Slide ${slide.slideNumber} of ${slides.length}`, 236, 135, { align: 'right' });
    });

    const arrayBuffer = pdf.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
}
