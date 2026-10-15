import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export interface PageNumberOptions {
    position: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left';
    format: 'Page {n} of {total}' | '{n} / {total}' | '{n}' | '- {n} -';
    fontSize?: number;
    startPage?: number; // 1-indexed, e.g. 2 means skip page 1
    startNumber?: number; // Starting number counter, e.g. 1
    colorHex?: string;
    fontFamily?: 'Helvetica' | 'Times' | 'Courier';
}

export interface WatermarkTextOptions {
    type: 'text';
    text: string;
    opacity?: number; // 0.1 to 1.0
    fontSize?: number;
    rotationAngle?: number; // degrees, e.g. -45, 0, 45
    colorHex?: string;
    layout?: 'center' | 'diagonal-grid';
}

export interface WatermarkImageOptions {
    type: 'image';
    imageBytes: ArrayBuffer;
    imageType: 'png' | 'jpeg';
    opacity?: number;
    scale?: number;
    rotationAngle?: number;
}

export type WatermarkOptions = WatermarkTextOptions | WatermarkImageOptions;

const hexToRgb01 = (hex: string) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
    const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
    const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
    return rgb(r, g, b);
};

export async function rotatePdfPages(
    pdfBytes: Uint8Array,
    rotations: Record<number, number> // pageIndex -> absolute or delta degrees
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    for (const [pageIdxStr, rot] of Object.entries(rotations)) {
        const pageIdx = Number(pageIdxStr);
        if (pageIdx >= 0 && pageIdx < pages.length) {
            const page = pages[pageIdx];
            const currentRotation = page.getRotation().angle;
            const newAngle = (currentRotation + rot) % 360;
            page.setRotation(degrees(newAngle));
        }
    }

    return await pdfDoc.save();
}

export async function cropPdfPages(
    pdfBytes: Uint8Array,
    options: {
        allPages: boolean;
        targetPageIndex?: number;
        cropBox: { x: number; y: number; width: number; height: number };
    }
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const applyCrop = (page: any) => {
        const { x, y, width, height } = options.cropBox;
        page.setCropBox(x, y, width, height);
    };

    if (options.allPages) {
        pages.forEach(applyCrop);
    } else if (typeof options.targetPageIndex === 'number' && pages[options.targetPageIndex]) {
        applyCrop(pages[options.targetPageIndex]);
    }

    return await pdfDoc.save();
}

export async function addPageNumbers(
    pdfBytes: Uint8Array,
    options: PageNumberOptions
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    let font;
    if (options.fontFamily === 'Times') {
        font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    } else if (options.fontFamily === 'Courier') {
        font = await pdfDoc.embedFont(StandardFonts.Courier);
    } else {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const fontSize = options.fontSize || 10;
    const fontColor = options.colorHex ? hexToRgb01(options.colorHex) : rgb(0.35, 0.35, 0.35);
    const startPage = options.startPage || 1;
    let currentNumber = options.startNumber || 1;

    for (let i = 0; i < totalPages; i++) {
        const pageIdxOneBased = i + 1;
        if (pageIdxOneBased < startPage) {
            continue;
        }

        const page = pages[i];
        const { width, height } = page.getSize();

        let pageStr = options.format
            .replace('{n}', currentNumber.toString())
            .replace('{total}', totalPages.toString());

        const textWidth = font.widthOfTextAtSize(pageStr, fontSize);
        const marginX = 40;
        const marginY = 30;

        let x = marginX;
        let y = marginY;

        switch (options.position) {
            case 'bottom-left':
                x = marginX;
                y = marginY;
                break;
            case 'bottom-center':
                x = (width - textWidth) / 2;
                y = marginY;
                break;
            case 'bottom-right':
                x = width - textWidth - marginX;
                y = marginY;
                break;
            case 'top-left':
                x = marginX;
                y = height - marginY;
                break;
            case 'top-center':
                x = (width - textWidth) / 2;
                y = height - marginY;
                break;
            case 'top-right':
                x = width - textWidth - marginX;
                y = height - marginY;
                break;
        }

        page.drawText(pageStr, {
            x,
            y,
            size: fontSize,
            font,
            color: fontColor,
        });

        currentNumber++;
    }

    return await pdfDoc.save();
}

export async function addWatermark(
    pdfBytes: Uint8Array,
    options: WatermarkOptions
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    if (options.type === 'text') {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = options.fontSize || 48;
        const opacity = typeof options.opacity === 'number' ? options.opacity : 0.25;
        const angle = degrees(typeof options.rotationAngle === 'number' ? options.rotationAngle : 45);
        const color = options.colorHex ? hexToRgb01(options.colorHex) : rgb(0.6, 0.6, 0.6);

        for (const page of pages) {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(options.text, fontSize);

            if (options.layout === 'diagonal-grid') {
                const stepX = width / 2;
                const stepY = height / 3;
                for (let x = 60; x < width; x += stepX) {
                    for (let y = 80; y < height; y += stepY) {
                        page.drawText(options.text, {
                            x,
                            y,
                            size: fontSize * 0.6,
                            font,
                            color,
                            opacity: opacity * 0.7,
                            rotate: angle,
                        });
                    }
                }
            } else {
                // Centered single watermark
                const centerX = (width - textWidth * 0.7) / 2;
                const centerY = height / 2;
                page.drawText(options.text, {
                    x: centerX,
                    y: centerY,
                    size: fontSize,
                    font,
                    color,
                    opacity,
                    rotate: angle,
                });
            }
        }
    } else if (options.type === 'image') {
        let embeddedImage;
        if (options.imageType === 'png') {
            embeddedImage = await pdfDoc.embedPng(options.imageBytes);
        } else {
            embeddedImage = await pdfDoc.embedJpg(options.imageBytes);
        }

        const scale = options.scale || 0.4;
        const opacity = typeof options.opacity === 'number' ? options.opacity : 0.3;
        const angle = degrees(options.rotationAngle || 0);

        for (const page of pages) {
            const { width, height } = page.getSize();
            const imgWidth = embeddedImage.width * scale;
            const imgHeight = embeddedImage.height * scale;
            const x = (width - imgWidth) / 2;
            const y = (height - imgHeight) / 2;

            page.drawImage(embeddedImage, {
                x,
                y,
                width: imgWidth,
                height: imgHeight,
                opacity,
                rotate: angle,
            });
        }
    }

    return await pdfDoc.save();
}
