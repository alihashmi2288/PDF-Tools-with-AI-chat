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

/**
 * Remove specified page indices (0-indexed) from a PDF
 */
export async function deletePdfPages(
    pdfBytes: Uint8Array,
    pageIndicesToRemove: number[]
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const sortedDescending = [...new Set(pageIndicesToRemove)].sort((a, b) => b - a);
    const totalPages = pdfDoc.getPageCount();

    for (const idx of sortedDescending) {
        if (idx >= 0 && idx < totalPages) {
            pdfDoc.removePage(idx);
        }
    }

    return await pdfDoc.save();
}

/**
 * Reorder pages based on an array of 0-indexed page positions
 */
export async function reorderPdfPages(
    pdfBytes: Uint8Array,
    newOrderIndices: number[]
): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(pdfBytes);
    const newDoc = await PDFDocument.create();

    const copiedPages = await newDoc.copyPages(srcDoc, newOrderIndices);
    copiedPages.forEach(p => newDoc.addPage(p));

    return await newDoc.save();
}

/**
 * Extract specified 0-indexed pages into a fresh PDF
 */
export async function extractPdfPages(
    pdfBytes: Uint8Array,
    pageIndices: number[]
): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(pdfBytes);
    const newDoc = await PDFDocument.create();

    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach(p => newDoc.addPage(p));

    return await newDoc.save();
}

export interface HeaderFooterOptions {
    headerLeft?: string;
    headerCenter?: string;
    headerRight?: string;
    footerLeft?: string;
    footerCenter?: string;
    footerRight?: string;
    fontSize?: number;
    colorHex?: string;
    skipFirstPage?: boolean;
    filename?: string;
}

/**
 * Add customizable running headers and footers to all pages
 */
export async function addHeaderAndFooter(
    pdfBytes: Uint8Array,
    options: HeaderFooterOptions
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const fontSize = options.fontSize || 9;
    const fontColor = options.colorHex ? hexToRgb01(options.colorHex) : rgb(0.4, 0.4, 0.4);
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const filenameStr = options.filename || 'Document';

    const formatText = (template: string, pageNum: number) => {
        return template
            .replace(/\{page\}/gi, pageNum.toString())
            .replace(/\{total\}/gi, totalPages.toString())
            .replace(/\{date\}/gi, dateStr)
            .replace(/\{filename\}/gi, filenameStr);
    };

    const marginX = 36;
    const marginY = 28;

    for (let i = 0; i < totalPages; i++) {
        if (options.skipFirstPage && i === 0) continue;

        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNum = i + 1;

        // Headers
        if (options.headerLeft) {
            const txt = formatText(options.headerLeft, pageNum);
            page.drawText(txt, { x: marginX, y: height - marginY, size: fontSize, font, color: fontColor });
        }
        if (options.headerCenter) {
            const txt = formatText(options.headerCenter, pageNum);
            const txtWidth = font.widthOfTextAtSize(txt, fontSize);
            page.drawText(txt, { x: (width - txtWidth) / 2, y: height - marginY, size: fontSize, font, color: fontColor });
        }
        if (options.headerRight) {
            const txt = formatText(options.headerRight, pageNum);
            const txtWidth = font.widthOfTextAtSize(txt, fontSize);
            page.drawText(txt, { x: width - txtWidth - marginX, y: height - marginY, size: fontSize, font, color: fontColor });
        }

        // Footers
        if (options.footerLeft) {
            const txt = formatText(options.footerLeft, pageNum);
            page.drawText(txt, { x: marginX, y: marginY, size: fontSize, font, color: fontColor });
        }
        if (options.footerCenter) {
            const txt = formatText(options.footerCenter, pageNum);
            const txtWidth = font.widthOfTextAtSize(txt, fontSize);
            page.drawText(txt, { x: (width - txtWidth) / 2, y: marginY, size: fontSize, font, color: fontColor });
        }
        if (options.footerRight) {
            const txt = formatText(options.footerRight, pageNum);
            const txtWidth = font.widthOfTextAtSize(txt, fontSize);
            page.drawText(txt, { x: width - txtWidth - marginX, y: marginY, size: fontSize, font, color: fontColor });
        }
    }

    return await pdfDoc.save();
}

/**
 * Resize all PDF pages to standard or custom dimensions
 */
export async function resizePdfPages(
    pdfBytes: Uint8Array,
    targetWidth: number,
    targetHeight: number,
    fitMode: 'fit' | 'center' | 'stretch' = 'fit'
): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(pdfBytes);
    const newDoc = await PDFDocument.create();
    const pageCount = srcDoc.getPageCount();

    for (let i = 0; i < pageCount; i++) {
        const [embeddedPage] = await newDoc.embedPdf(srcDoc, [i]);
        const newPage = newDoc.addPage([targetWidth, targetHeight]);
        const origWidth = embeddedPage.width;
        const origHeight = embeddedPage.height;

        let drawWidth = targetWidth;
        let drawHeight = targetHeight;
        let x = 0;
        let y = 0;

        if (fitMode === 'stretch') {
            drawWidth = targetWidth;
            drawHeight = targetHeight;
        } else if (fitMode === 'center') {
            drawWidth = origWidth;
            drawHeight = origHeight;
            x = (targetWidth - drawWidth) / 2;
            y = (targetHeight - drawHeight) / 2;
        } else {
            // 'fit' preserving aspect ratio
            const scale = Math.min(targetWidth / origWidth, targetHeight / origHeight);
            drawWidth = origWidth * scale;
            drawHeight = origHeight * scale;
            x = (targetWidth - drawWidth) / 2;
            y = (targetHeight - drawHeight) / 2;
        }

        newPage.drawPage(embeddedPage, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
        });
    }

    return await newDoc.save();
}

/**
 * Flatten interactive form fields, annotations, and digital signatures
 */
export async function flattenPdf(pdfBytes: Uint8Array): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    try {
        const form = pdfDoc.getForm();
        form.flatten();
    } catch {
        // PDF has no form or already flattened
    }
    return await pdfDoc.save();
}

/**
 * Convert PDF pages to Grayscale or Pure Monochrome
 */
export async function convertPdfToGrayscale(
    pdfBytes: Uint8Array,
    mode: 'grayscale' | 'monochrome' = 'grayscale',
    threshold: number = 128
): Promise<Uint8Array> {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const loadingTask = pdfjs.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    const newDoc = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for crisp text
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            for (let p = 0; p < data.length; p += 4) {
                // ITU-R BT.601 luminance formula
                const gray = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
                if (mode === 'monochrome') {
                    const monoVal = gray >= threshold ? 255 : 0;
                    data[p] = monoVal;
                    data[p + 1] = monoVal;
                    data[p + 2] = monoVal;
                } else {
                    data[p] = gray;
                    data[p + 1] = gray;
                    data[p + 2] = gray;
                }
            }
            ctx.putImageData(imgData, 0, 0);

            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const base64Data = imgDataUrl.split(',')[1];
            const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

            const embeddedImage = await newDoc.embedJpg(imgBytes);
            const origViewport = page.getViewport({ scale: 1.0 });
            const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
            newPage.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: origViewport.width,
                height: origViewport.height,
            });
        }
    }

    return await newDoc.save();
}

export interface BookmarkChapter {
    title: string;
    startPage: number; // 1-indexed
    endPage: number; // 1-indexed
    pageCount: number;
}

/**
 * Extracts document outline / bookmarks with page ranges
 */
export async function extractPdfBookmarks(pdfBytes: Uint8Array): Promise<BookmarkChapter[]> {
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const loadingTask = pdfjs.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    const outline = await pdf.getOutline();

    if (!outline || outline.length === 0) {
        return [];
    }

    const chapters: { title: string; pageIndex: number }[] = [];

    const processItem = async (item: any) => {
        let dest = item.dest;
        if (typeof dest === 'string') {
            dest = await pdf.getDestination(dest);
        }
        if (Array.isArray(dest) && dest.length > 0) {
            try {
                const pageIndex = await pdf.getPageIndex(dest[0]);
                chapters.push({ title: item.title, pageIndex });
            } catch {
                // destination could not be resolved
            }
        }
        if (item.items && Array.isArray(item.items)) {
            for (const subItem of item.items) {
                await processItem(subItem);
            }
        }
    };

    for (const item of outline) {
        await processItem(item);
    }

    // Sort chapters by pageIndex
    chapters.sort((a, b) => a.pageIndex - b.pageIndex);

    // Filter duplicates on same page
    const distinctChapters = chapters.filter((ch, i, arr) => i === 0 || ch.pageIndex !== arr[i - 1].pageIndex);

    const totalPages = pdf.numPages;
    return distinctChapters.map((ch, idx) => {
        const startPage = ch.pageIndex + 1;
        const endPage = idx < distinctChapters.length - 1 ? distinctChapters[idx + 1].pageIndex : totalPages;
        return {
            title: ch.title || `Chapter ${idx + 1}`,
            startPage,
            endPage,
            pageCount: endPage - startPage + 1,
        };
    });
}

/**
 * Split PDF into chapter PDFs based on outline / bookmarks, packed into a ZIP
 */
export async function splitPdfByBookmarks(
    pdfBytes: Uint8Array,
    selectedChapters?: BookmarkChapter[]
): Promise<Uint8Array> {
    const JSZip = (await import('jszip')).default;
    const chapters = selectedChapters || await extractPdfBookmarks(pdfBytes);

    if (chapters.length === 0) {
        throw new Error('No bookmarks found to split by');
    }

    const srcDoc = await PDFDocument.load(pdfBytes);
    const zip = new JSZip();

    for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const newDoc = await PDFDocument.create();
        const pageIndices: number[] = [];

        for (let p = ch.startPage - 1; p <= ch.endPage - 1; p++) {
            pageIndices.push(p);
        }

        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(p => newDoc.addPage(p));
        const chapterPdfBytes = await newDoc.save();

        const safeTitle = ch.title.replace(/[/\\?%*:|"<>]/g, '_').substring(0, 50);
        const filename = `${String(i + 1).padStart(2, '0')} - ${safeTitle}.pdf`;
        zip.file(filename, chapterPdfBytes);
    }

    return await zip.generateAsync({ type: 'uint8array' });
}


