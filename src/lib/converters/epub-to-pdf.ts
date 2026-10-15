/**
 * EPUB to PDF Converter Utility
 * Unpacks EPUB spine, parses XHTML chapters, and formats into a paginated eBook PDF
 */
export async function convertEpubToPdf(file: File | ArrayBuffer): Promise<Uint8Array> {
    const JSZip = (await import('jszip')).default;
    const { jsPDF } = await import('jspdf');

    const zip = new JSZip();
    const data = file instanceof File ? await file.arrayBuffer() : file;
    const zipArchive = await zip.loadAsync(data);

    // 1. Locate container.xml
    const containerXml = await zipArchive.file('META-INF/container.xml')?.async('string');
    if (!containerXml) {
        throw new Error('Invalid EPUB: missing META-INF/container.xml');
    }

    const domParser = new DOMParser();
    const containerDoc = domParser.parseFromString(containerXml, 'text/xml');
    const rootfileElem = containerDoc.getElementsByTagName('rootfile')[0];
    const opfPath = rootfileElem?.getAttribute('full-path') || 'OEBPS/content.opf';
    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

    // 2. Read OPF file
    const opfXml = await zipArchive.file(opfPath)?.async('string');
    if (!opfXml) {
        throw new Error(`Invalid EPUB: cannot read ${opfPath}`);
    }

    const opfDoc = domParser.parseFromString(opfXml, 'text/xml');
    const title = opfDoc.getElementsByTagName('dc:title')[0]?.textContent || 'eBook';
    const author = opfDoc.getElementsByTagName('dc:creator')[0]?.textContent || 'Unknown Author';

    // Build manifest item map
    const manifestItems = new Map<string, string>();
    const itemElems = opfDoc.getElementsByTagName('item');
    for (let i = 0; i < itemElems.length; i++) {
        const id = itemElems[i].getAttribute('id');
        const href = itemElems[i].getAttribute('href');
        if (id && href) {
            manifestItems.set(id, opfDir + href);
        }
    }

    // Read spine order
    const spineItemRefs = opfDoc.getElementsByTagName('itemref');
    const chapterHrefs: string[] = [];
    for (let i = 0; i < spineItemRefs.length; i++) {
        const idref = spineItemRefs[i].getAttribute('idref');
        if (idref && manifestItems.has(idref)) {
            chapterHrefs.push(manifestItems.get(idref)!);
        }
    }

    // Initialize PDF with book proportions (A5 or A4)
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

    // Cover Page
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.setTextColor(15, 23, 42);
    const coverTitleLines = pdf.splitTextToSize(title, contentWidth);
    pdf.text(coverTitleLines, margin, 100);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`By ${author}`, margin, 120 + (coverTitleLines.length * 8));

    // Process each chapter
    for (const href of chapterHrefs) {
        const chapterFile = zipArchive.file(href);
        if (!chapterFile) continue;

        const xhtmlStr = await chapterFile.async('string');
        const chapterDoc = domParser.parseFromString(xhtmlStr, 'text/html');

        // Extract paragraphs and headings
        const elements = chapterDoc.querySelectorAll('h1, h2, h3, p');
        if (elements.length === 0) continue;

        pdf.addPage();
        let currentY = margin + 10;

        // Running header
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(title, margin, margin - 10);
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(margin, margin - 7, pageWidth - margin, margin - 7);

        elements.forEach((el) => {
            const tag = el.tagName.toLowerCase();
            const text = el.textContent?.trim() || '';
            if (!text) return;

            if (tag === 'h1' || tag === 'h2') {
                if (currentY > pageHeight - margin - 35) {
                    pdf.addPage();
                    currentY = margin + 10;
                }
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(tag === 'h1' ? 18 : 14);
                pdf.setTextColor(15, 23, 42);
                currentY += 8;
                const lines = pdf.splitTextToSize(text, contentWidth);
                pdf.text(lines, margin, currentY);
                currentY += (lines.length * (tag === 'h1' ? 8 : 6)) + 6;
            } else {
                pdf.setFont('times', 'normal');
                pdf.setFontSize(11);
                pdf.setTextColor(30, 41, 59);
                const lines = pdf.splitTextToSize(text, contentWidth);
                
                for (const line of lines) {
                    if (currentY > pageHeight - margin - 15) {
                        pdf.addPage();
                        currentY = margin + 10;
                    }
                    pdf.text(line, margin, currentY);
                    currentY += 5.5;
                }
                currentY += 3;
            }
        });
    }

    const arrayBuffer = pdf.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
}
