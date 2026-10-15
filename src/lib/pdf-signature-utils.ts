import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface SignatureFieldItem {
    id: string;
    type: 'signature-image' | 'typed-text' | 'date-stamp' | 'initials' | 'checkmark';
    pageIndex: number; // 0-indexed
    xPercent: number;  // 0 to 100 percentage from left
    yPercent: number;  // 0 to 100 percentage from top
    widthPercent: number; // percentage of page width
    heightPercent: number; // percentage of page height
    imageDataUrl?: string; // transparent PNG data URL
    textContent?: string;
    textColorHex?: string;
    fontFamily?: string;
}

export async function signPdfDocument(
    pdfBytes: Uint8Array,
    fields: SignatureFieldItem[]
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Group fields by page for efficiency
    for (const field of fields) {
        if (field.pageIndex < 0 || field.pageIndex >= pages.length) continue;
        const page = pages[field.pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Convert percentage coordinates to PDF points.
        // In PDF coordinates: (0, 0) is bottom-left, so y = pageHeight - (yPercent/100 * pageHeight) - height
        const boxWidth = (field.widthPercent / 100) * pageWidth;
        const boxHeight = (field.heightPercent / 100) * pageHeight;
        const x = (field.xPercent / 100) * pageWidth;
        const y = pageHeight - ((field.yPercent / 100) * pageHeight) - boxHeight;

        if (field.type === 'signature-image' && field.imageDataUrl) {
            try {
                // Strip metadata prefix if present
                const base64Data = field.imageDataUrl.includes(',') 
                    ? field.imageDataUrl.split(',')[1] 
                    : field.imageDataUrl;
                const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                
                let embeddedImg;
                if (field.imageDataUrl.includes('image/jpeg') || field.imageDataUrl.includes('image/jpg')) {
                    embeddedImg = await pdfDoc.embedJpg(imageBytes);
                } else {
                    embeddedImg = await pdfDoc.embedPng(imageBytes);
                }

                page.drawImage(embeddedImg, {
                    x,
                    y,
                    width: boxWidth,
                    height: boxHeight,
                });
            } catch (err) {
                console.error("Failed to embed signature image:", err);
            }
        } else if (field.type === 'checkmark') {
            // Draw a checkmark using vector lines
            const checkColor = field.textColorHex 
                ? rgb(
                    parseInt(field.textColorHex.slice(1, 3), 16) / 255 || 0,
                    parseInt(field.textColorHex.slice(3, 5), 16) / 255 || 0,
                    parseInt(field.textColorHex.slice(5, 7), 16) / 255 || 0
                )
                : rgb(0.1, 0.5, 0.2);

            page.drawText('✓', {
                x: x + 4,
                y: y + 2,
                size: Math.max(14, boxHeight * 0.75),
                font: boldFont,
                color: checkColor,
            });
        } else {
            // Text, date, initials, or typed signature
            const text = field.textContent || '';
            const color = field.textColorHex 
                ? rgb(
                    parseInt(field.textColorHex.slice(1, 3), 16) / 255 || 0,
                    parseInt(field.textColorHex.slice(3, 5), 16) / 255 || 0,
                    parseInt(field.textColorHex.slice(5, 7), 16) / 255 || 0
                )
                : rgb(0.1, 0.1, 0.2);

            // Compute font size to fit roughly within the box height
            const fontSize = Math.min(Math.max(10, boxHeight * 0.55), 24);
            page.drawText(text, {
                x: x + 4,
                y: y + (boxHeight - fontSize) / 2,
                size: fontSize,
                font: field.type === 'typed-text' ? boldFont : standardFont,
                color,
            });
        }
    }

    return await pdfDoc.save();
}
