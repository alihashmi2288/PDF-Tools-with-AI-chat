"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Type, Square, Save, Trash2, Move, Loader2, Image as ImageIcon, Bold, Italic, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABLE_FONTS, FontDefinition } from "@/lib/fonts";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface EditorElement {
    id: string;
    type: 'text' | 'rect' | 'image';
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    page: number; // 1-based
    content?: string;
    width?: number; // Percentage
    height?: number; // Percentage
    color?: string;
    image?: string; // Base64 string
    fontSize?: number;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
}

interface PDFEditorProps {
    file: File;
}

export function PDFEditor({ file }: PDFEditorProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState(1.0);
    const [elements, setElements] = useState<EditorElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [tool, setTool] = useState<'select' | 'text' | 'rect'>('select');
    const [resizing, setResizing] = useState<{ id: string, handle: string, startX: number, startY: number, startWidth: number, startHeight: number, startElX: number, startElY: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Load Google Fonts for preview
    useEffect(() => {
        const fontFamilies = AVAILABLE_FONTS
            .filter(f => f.type === 'custom')
            .map(f => f.value)
            .join('&family=');

        if (fontFamilies) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies.replace(/ /g, '+')}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            };
        }
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    };

    // Helper for ID generation
    const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const addText = () => {
        const newElement: EditorElement = {
            id: generateId(),
            type: 'text',
            x: 50,
            y: 50,
            page: currentPage,
            content: "New Text",
            color: "#000000",
            fontSize: 12,
            fontFamily: "Helvetica",
            isBold: false,
            isItalic: false,
            isUnderline: false
        };
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
        setTool('select');
    };

    const addRect = () => {
        const newElement: EditorElement = {
            id: generateId(),
            type: 'rect',
            x: 40,
            y: 40,
            width: 20,
            height: 10,
            page: currentPage,
            color: "#ffffff" // White to cover/delete text
        };
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
        setTool('select');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const newElement: EditorElement = {
                id: generateId(),
                type: 'image',
                x: 30,
                y: 30,
                width: 30,
                height: 20, // Initial aspect ratio might need adjustment, but this is a start
                page: currentPage,
                image: base64
            };
            setElements([...elements, newElement]);
            setSelectedId(newElement.id);
            setTool('select');
        };
        reader.readAsDataURL(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const updateElement = (id: string, updates: Partial<EditorElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const removeElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        setSelectedId(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const pages = pdfDoc.getPages();

            // Cache for embedded fonts to avoid re-embedding/re-fetching
            const fontCache: { [key: string]: any } = {};

            for (const el of elements) {
                const pageIndex = el.page - 1;
                if (pageIndex >= pages.length) continue;

                const page = pages[pageIndex];
                const { width, height } = page.getSize();

                const x = (el.x / 100) * width;
                const y = height - ((el.y / 100) * height);

                if (el.type === 'text' && el.content) {
                    const { r, g, b } = hexToRgb(el.color || "#000000");

                    let font;
                    const fontDef = AVAILABLE_FONTS.find(f => f.value === el.fontFamily) || AVAILABLE_FONTS[0];
                    const fontKey = `${fontDef.name}-${el.isBold ? 'bold' : 'normal'}-${el.isItalic ? 'italic' : 'normal'}`;

                    if (fontCache[fontKey]) {
                        font = fontCache[fontKey];
                    } else {
                        if (fontDef.type === 'custom') {
                            let url = fontDef.regularUrl;
                            if (el.isBold && el.isItalic) url = fontDef.boldItalicUrl || fontDef.regularUrl;
                            else if (el.isBold) url = fontDef.boldUrl || fontDef.regularUrl;
                            else if (el.isItalic) url = fontDef.italicUrl || fontDef.regularUrl;

                            if (url) {
                                try {
                                    const fontBytes = await fetch(url).then(res => res.arrayBuffer());
                                    font = await pdfDoc.embedFont(fontBytes);
                                } catch (e) {
                                    console.error(`Failed to load font ${fontDef.name}`, e);
                                    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                                }
                            } else {
                                font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                            }
                        } else {
                            // Standard Fonts
                            let fontToEmbed = StandardFonts.Helvetica;
                            if (el.fontFamily === 'Times-Roman') {
                                if (el.isBold && el.isItalic) fontToEmbed = StandardFonts.TimesRomanBoldItalic;
                                else if (el.isBold) fontToEmbed = StandardFonts.TimesRomanBold;
                                else if (el.isItalic) fontToEmbed = StandardFonts.TimesRomanItalic;
                                else fontToEmbed = StandardFonts.TimesRoman;
                            } else if (el.fontFamily === 'Courier') {
                                if (el.isBold && el.isItalic) fontToEmbed = StandardFonts.CourierBoldOblique;
                                else if (el.isBold) fontToEmbed = StandardFonts.CourierBold;
                                else if (el.isItalic) fontToEmbed = StandardFonts.CourierOblique;
                                else fontToEmbed = StandardFonts.Courier;
                            } else {
                                // Helvetica (Default)
                                if (el.isBold && el.isItalic) fontToEmbed = StandardFonts.HelveticaBoldOblique;
                                else if (el.isBold) fontToEmbed = StandardFonts.HelveticaBold;
                                else if (el.isItalic) fontToEmbed = StandardFonts.HelveticaOblique;
                                else fontToEmbed = StandardFonts.Helvetica;
                            }
                            font = await pdfDoc.embedFont(fontToEmbed);
                        }
                        fontCache[fontKey] = font;
                    }

                    const size = el.fontSize || 12;

                    page.drawText(el.content, {
                        x,
                        y: y - size,
                        size: size,
                        font: font,
                        color: rgb(r, g, b),
                    });

                    if (el.isUnderline) {
                        const width = font.widthOfTextAtSize(el.content, size);
                        page.drawLine({
                            start: { x, y: y - size - 2 },
                            end: { x: x + width, y: y - size - 2 },
                            thickness: size / 15,
                            color: rgb(r, g, b),
                        });
                    }
                } else if (el.type === 'rect' && el.width && el.height) {
                    const w = (el.width / 100) * width;
                    const h = (el.height / 100) * height;
                    const { r, g, b } = hexToRgb(el.color || "#ffffff");

                    page.drawRectangle({
                        x,
                        y: y - h,
                        width: w,
                        height: h,
                        color: rgb(r, g, b),
                    });
                } else if (el.type === 'image' && el.image && el.width && el.height) {
                    const w = (el.width / 100) * width;
                    const h = (el.height / 100) * height;

                    let image;
                    if (el.image.startsWith('data:image/png')) {
                        image = await pdfDoc.embedPng(el.image);
                    } else {
                        image = await pdfDoc.embedJpg(el.image);
                    }

                    page.drawImage(image, {
                        x,
                        y: y - h,
                        width: w,
                        height: h,
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `edited-${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save PDF. Check console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDragStart = (e: React.MouseEvent, id: string) => {
        if (tool !== 'select') return;
        e.stopPropagation();
        setSelectedId(id);

        const el = elements.find(e => e.id === id);
        if (!el || !containerRef.current) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startElX = el.x;
        const startElY = el.y;

        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const dxPercent = (dx / containerWidth) * 100;
            const dyPercent = (dy / containerHeight) * 100;

            updateElement(id, {
                x: Math.max(0, Math.min(100, startElX + dxPercent)),
                y: Math.max(0, Math.min(100, startElY + dyPercent))
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeStart = (e: React.MouseEvent, id: string, handle: string) => {
        e.stopPropagation();
        const el = elements.find(e => e.id === id);
        if (!el || !containerRef.current) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const dxPercent = (dx / containerWidth) * 100;
            const dyPercent = (dy / containerHeight) * 100;

            let newWidth = el.width || 0;
            let newHeight = el.height || 0;
            let newX = el.x;
            let newY = el.y;

            if (handle.includes('e')) newWidth += dxPercent;
            if (handle.includes('w')) {
                newWidth -= dxPercent;
                newX += dxPercent;
            }
            if (handle.includes('s')) newHeight += dyPercent;
            if (handle.includes('n')) {
                newHeight -= dyPercent;
                newY += dyPercent;
            }

            updateElement(id, {
                width: Math.max(1, newWidth),
                height: Math.max(1, newHeight),
                x: newX,
                y: newY
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-2 border rounded-lg bg-background sticky top-0 z-10 shadow-sm flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant={tool === 'select' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setTool('select')}
                    >
                        <Move className="h-4 w-4 mr-2" /> Select
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addText}
                    >
                        <Type className="h-4 w-4 mr-2" /> Add Text
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addRect}
                    >
                        <Square className="h-4 w-4 mr-2" /> Delete Text
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />

                    {selectedId && (
                        <>
                            <div className="flex items-center gap-2 ml-2 border-l pl-2">
                                <span className="text-sm text-muted-foreground">Color:</span>
                                <input
                                    type="color"
                                    value={elements.find(e => e.id === selectedId)?.color || "#000000"}
                                    onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                                    className="h-8 w-8 p-0 border-0 rounded cursor-pointer"
                                />
                            </div>
                            {elements.find(e => e.id === selectedId)?.type === 'text' && (
                                <>
                                    <div className="flex items-center gap-2 ml-2 border-l pl-2">
                                        <span className="text-sm text-muted-foreground">Size:</span>
                                        <input
                                            type="number"
                                            value={elements.find(e => e.id === selectedId)?.fontSize || 12}
                                            onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })}
                                            className="h-8 w-16 p-1 border rounded bg-background"
                                            min="8"
                                            max="72"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 ml-2 border-l pl-2">
                                        <span className="text-sm text-muted-foreground">Font:</span>
                                        <select
                                            value={elements.find(e => e.id === selectedId)?.fontFamily || 'Helvetica'}
                                            onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
                                            className="h-8 p-1 border rounded bg-background w-32"
                                        >
                                            {AVAILABLE_FONTS.map(font => (
                                                <option key={font.name} value={font.value}>{font.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 border-l pl-2">
                                        <Button
                                            variant={elements.find(e => e.id === selectedId)?.isBold ? "secondary" : "ghost"}
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateElement(selectedId, { isBold: !elements.find(e => e.id === selectedId)?.isBold })}
                                        >
                                            <Bold className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={elements.find(e => e.id === selectedId)?.isItalic ? "secondary" : "ghost"}
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateElement(selectedId, { isItalic: !elements.find(e => e.id === selectedId)?.isItalic })}
                                        >
                                            <Italic className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={elements.find(e => e.id === selectedId)?.isUnderline ? "secondary" : "ghost"}
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateElement(selectedId, { isUnderline: !elements.find(e => e.id === selectedId)?.isUnderline })}
                                        >
                                            <Underline className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mr-4">
                        <Button variant="ghost" size="icon" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</Button>
                        <span>Page {currentPage} of {numPages}</span>
                        <Button variant="ghost" size="icon" disabled={currentPage >= numPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</Button>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving} variant="outline">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save PDF
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-muted/20 rounded-lg p-4 overflow-auto flex justify-center min-h-[600px]">
                <div className="relative shadow-lg" ref={containerRef}>
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="max-w-full"
                    >
                        <Page
                            pageNumber={currentPage}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="border bg-white"
                        />
                    </Document>

                    <div className="absolute inset-0 pointer-events-none">
                        {elements.filter(el => el.page === currentPage).map(el => (
                            <div
                                key={el.id}
                                className={cn(
                                    "absolute pointer-events-auto cursor-move group",
                                    selectedId === el.id ? "ring-2 ring-blue-500" : ""
                                )}
                                style={{
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    width: (el.type === 'rect' || el.type === 'image') ? `${el.width}%` : 'auto',
                                    height: (el.type === 'rect' || el.type === 'image') ? `${el.height}%` : 'auto',
                                    backgroundColor: el.type === 'rect' ? el.color : 'transparent',
                                    color: el.type === 'text' ? el.color : 'inherit',
                                }}
                                onMouseDown={(e) => handleDragStart(e, el.id)}
                            >
                                {el.type === 'image' && el.image && (
                                    <img src={el.image} alt="Added" className="w-full h-full object-contain pointer-events-none" />
                                )}
                                {el.type === 'text' && (
                                    <div className="relative">
                                        {selectedId === el.id ? (
                                            <input
                                                value={el.content}
                                                onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                                className="bg-transparent border-none focus:outline-none min-w-[100px]"
                                                style={{
                                                    color: el.color,
                                                    fontSize: `${el.fontSize}px`,
                                                    fontFamily: el.fontFamily,
                                                    fontWeight: el.isBold ? 'bold' : 'normal',
                                                    fontStyle: el.isItalic ? 'italic' : 'normal',
                                                    textDecoration: el.isUnderline ? 'underline' : 'none'
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className="whitespace-nowrap px-1"
                                                style={{
                                                    color: el.color,
                                                    fontSize: `${el.fontSize}px`,
                                                    fontFamily: el.fontFamily,
                                                    fontWeight: el.isBold ? 'bold' : 'normal',
                                                    fontStyle: el.isItalic ? 'italic' : 'normal',
                                                    textDecoration: el.isUnderline ? 'underline' : 'none'
                                                }}
                                            >
                                                {el.content}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {selectedId === el.id && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                        className="absolute -top-5 -right-5 bg-destructive text-destructive-foreground p-2 rounded-full z-20 hover:bg-destructive/90 transition-colors shadow-sm"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}

                                {selectedId === el.id && (el.type === 'rect' || el.type === 'image') && (
                                    <>
                                        {/* Corners */}
                                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 'nw')} />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 'ne')} />
                                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 'sw')} />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 'se')} />

                                        {/* Sides */}
                                        <div className="absolute top-1/2 -left-1 w-3 h-3 -mt-1.5 bg-blue-500 cursor-w-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 'w')} />
                                        <div className="absolute top-1/2 -right-1 w-3 h-3 -mt-1.5 bg-blue-500 cursor-e-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 'e')} />
                                        <div className="absolute -top-1 left-1/2 w-3 h-3 -ml-1.5 bg-blue-500 cursor-n-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 'n')} />
                                        <div className="absolute -bottom-1 left-1/2 w-3 h-3 -ml-1.5 bg-blue-500 cursor-s-resize z-30" onMouseDown={(e) => handleResizeStart(e, el.id, 's')} />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
