/**
 * JSON & XML to PDF Report Generator Utility
 * Formats structured records and data tables into publication-ready PDF reports
 */
export interface ReportOptions {
    title?: string;
    subtitle?: string;
    organization?: string;
    theme?: 'indigo' | 'emerald' | 'slate' | 'classic';
}

export async function convertJsonToPdf(
    jsonData: any,
    options: ReportOptions = {}
): Promise<Uint8Array> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const title = options.title || 'Structured Data Report';
    const subtitle = options.subtitle || `Generated on ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
    const org = options.organization || 'PDF Master AI Analytics';

    // Theme color definitions
    const themes = {
        indigo: { primary: [79, 70, 229], headerBg: [99, 102, 241], alternateRow: [245, 247, 255] },
        emerald: { primary: [5, 150, 105], headerBg: [16, 185, 129], alternateRow: [240, 253, 244] },
        slate: { primary: [51, 65, 85], headerBg: [71, 85, 105], alternateRow: [248, 250, 252] },
        classic: { primary: [37, 99, 235], headerBg: [59, 130, 246], alternateRow: [239, 246, 255] },
    };
    const theme = themes[options.theme || 'indigo'];

    // Header decorative bar
    pdf.setFillColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    pdf.rect(0, 0, 210, 8, 'F');

    // Title and Metadata
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(17, 24, 39);
    pdf.text(title, 14, 24);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`${subtitle} • ${org}`, 14, 31);

    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.4);
    pdf.line(14, 36, 196, 36);

    // Normalize input to table data
    let headers: string[] = [];
    let rows: any[][] = [];

    if (Array.isArray(jsonData)) {
        if (jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0] !== null) {
            headers = Object.keys(jsonData[0]);
            rows = jsonData.map(item => headers.map(key => formatCell(item[key])));
        } else {
            headers = ['Index', 'Value'];
            rows = jsonData.map((val, idx) => [idx + 1, formatCell(val)]);
        }
    } else if (typeof jsonData === 'object' && jsonData !== null) {
        // Key-Value pairs
        headers = ['Field / Property', 'Value'];
        rows = Object.entries(jsonData).map(([k, v]) => [k, formatCell(v)]);
    } else {
        headers = ['Data'];
        rows = [[String(jsonData)]];
    }

    autoTable(pdf, {
        head: [headers],
        body: rows,
        startY: 42,
        theme: 'striped',
        headStyles: {
            fillColor: [theme.primary[0], theme.primary[1], theme.primary[2]],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
        },
        alternateRowStyles: {
            fillColor: [theme.alternateRow[0], theme.alternateRow[1], theme.alternateRow[2]],
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            overflow: 'linebreak',
        },
        margin: { left: 14, right: 14 },
    });

    const arrayBuffer = pdf.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
}

function formatCell(val: any): string {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}

/**
 * Converts XML string into a structured JSON object
 */
export function parseXmlToJson(xmlStr: string): any {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
    
    function parseNode(node: Node): any {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.nodeValue?.trim();
        }
        const obj: any = {};
        if (node.hasChildNodes()) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const nodeName = child.nodeName;
                    const parsedChild = parseNode(child);
                    if (obj[nodeName]) {
                        if (!Array.isArray(obj[nodeName])) {
                            obj[nodeName] = [obj[nodeName]];
                        }
                        obj[nodeName].push(parsedChild);
                    } else {
                        obj[nodeName] = parsedChild;
                    }
                } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()) {
                    return child.nodeValue.trim();
                }
            }
        }
        return obj;
    }

    return parseNode(xmlDoc.documentElement);
}
