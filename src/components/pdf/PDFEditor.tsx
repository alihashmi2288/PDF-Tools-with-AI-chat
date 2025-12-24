"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Type, Square, Save, Trash2, Move, Loader2, Image as ImageIcon, Bold, Italic, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABLE_FONTS } from "@/lib/fonts";

// Configure worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface EditorElement {
    id: string;
    type: 'text' | 'rect' | 'image';
    x: number;
    y: number;
    page: number;
    content?: string;
    width?: number;
    height?: number;
    color?: string;
    image?: string;
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
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, handle: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Get page dimensions for accurate positioning
    useEffect(() => {
        if (containerRef.current) {
            const pageElement = containerRef.current.querySelector('.react-pdf__Page');
            if (pageElement) {
                const rect = pageElement.getBoundingClientRect();
                setPageSize({ width: rect.width, height: rect.height });
            }
        }
    }, [scale, currentPage]);

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    };

    const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const addText = () => {
        const newElement: EditorElement = {
            id: generateId(),
            type: 'text',
            x: 20,
            y: 20,
            page: currentPage,
            content: "Click to edit",
            color: "#000000",
            fontSize: 16,
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
            x: 30,
            y: 30,
            width: 25,
            height: 15,
            page: currentPage,
            color: "#ffffff"
        };
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
        setTool('select');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const newElement: EditorElement = {
                id: generateId(),
                type: 'image',
                x: 25,
                y: 25,
                width: 30,
                height: 20,
                page: currentPage,
                image: base64
            };
            setElements([...elements, newElement]);
            setSelectedId(newElement.id);
            setTool('select');
        };
        reader.readAsDataURL(uploadedFile);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const updateElement = (id: string, updates: Partial<EditorElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const removeElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        setSelectedId(null);
    };

    // Handle dragging
    const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
        if (tool !== 'select') return;
        e.preventDefault();
        e.stopPropagation();
        
        setSelectedId(elementId);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    // Handle resize start
    const handleResizeStart = (e: React.MouseEvent, elementId: string, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const element = elements.find(el => el.id === elementId);
        if (!element) return;
        
        setSelectedId(elementId);
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: element.width || 20,
            height: element.height || 15,
            handle
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        
        if (isDragging && selectedId && !isResizing) {
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            
            const element = elements.find(el => el.id === selectedId);
            if (!element) return;
            
            const newX = Math.max(0, Math.min(95, element.x + (deltaX / rect.width) * 100));
            const newY = Math.max(0, Math.min(95, element.y + (deltaY / rect.height) * 100));
            
            updateElement(selectedId, { x: newX, y: newY });
            setDragStart({ x: e.clientX, y: e.clientY });
        }
        
        if (isResizing && selectedId) {
            const element = elements.find(el => el.id === selectedId);
            if (!element) return;
            
            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;
            
            const deltaXPercent = (deltaX / rect.width) * 100;
            const deltaYPercent = (deltaY / rect.height) * 100;
            
            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;
            let newX = element.x;
            let newY = element.y;
            
            const handle = resizeStart.handle;
            
            // Handle width changes
            if (handle.includes('e')) {
                newWidth = Math.max(5, resizeStart.width + deltaXPercent);
            }
            if (handle.includes('w')) {
                const widthChange = -deltaXPercent;
                newWidth = Math.max(5, resizeStart.width + widthChange);
                if (newWidth > 5) {
                    newX = element.x - (newWidth - resizeStart.width);
                }
            }
            
            // Handle height changes
            if (handle.includes('s')) {
                newHeight = Math.max(3, resizeStart.height + deltaYPercent);
            }
            if (handle.includes('n')) {
                const heightChange = -deltaYPercent;
                newHeight = Math.max(3, resizeStart.height + heightChange);
                if (newHeight > 3) {
                    newY = element.y - (newHeight - resizeStart.height);
                }
            }
            
            // Ensure element stays within bounds
            newX = Math.max(0, Math.min(100 - newWidth, newX));
            newY = Math.max(0, Math.min(100 - newHeight, newY));
            
            updateElement(selectedId, {
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    // Add global mouse event listeners
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isResizing || isDragging) {
                handleMouseMove(e as any);
            }
        };
        
        const handleGlobalMouseUp = () => {
            handleMouseUp();
        };
        
        if (isResizing || isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }
        
        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isResizing, isDragging, selectedId, resizeStart, dragStart]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
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
                                if (el.isBold && el.isItalic) fontToEmbed = StandardFonts.HelveticaBoldOblique;
                                else if (el.isBold) fontToEmbed = StandardFonts.HelveticaBold;
                                else if (el.isItalic) fontToEmbed = StandardFonts.HelveticaOblique;
                                else fontToEmbed = StandardFonts.Helvetica;
                            }
                            font = await pdfDoc.embedFont(fontToEmbed);
                        }
                        fontCache[fontKey] = font;
                    }

                    const fontSize = el.fontSize || 16;
                    page.drawText(el.content, {
                        x,
                        y: y - fontSize,
                        size: fontSize,
                        font,
                        color: rgb(r, g, b)
                    });

                    // Add underline if needed
                    if (el.isUnderline) {
                        const textWidth = font.widthOfTextAtSize(el.content, fontSize);
                        page.drawLine({
                            start: { x, y: y - fontSize - 2 },
                            end: { x: x + textWidth, y: y - fontSize - 2 },
                            thickness: fontSize / 15,
                            color: rgb(r, g, b)
                        });
                    }
                } else if (el.type === 'rect' && el.width && el.height) {
                    const { r, g, b } = hexToRgb(el.color || "#ffffff");
                    const rectWidth = (el.width / 100) * width;
                    const rectHeight = (el.height / 100) * height;

                    page.drawRectangle({
                        x,
                        y: y - rectHeight,
                        width: rectWidth,
                        height: rectHeight,
                        color: rgb(r, g, b)
                    });
                } else if (el.type === 'image' && el.image && el.width && el.height) {
                    try {
                        let image;
                        if (el.image.startsWith('data:image/png')) {
                            const base64Data = el.image.split(',')[1];
                            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                            image = await pdfDoc.embedPng(imageBytes);
                        } else if (el.image.startsWith('data:image/jpeg') || el.image.startsWith('data:image/jpg')) {
                            const base64Data = el.image.split(',')[1];
                            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                            image = await pdfDoc.embedJpg(imageBytes);
                        }

                        if (image) {
                            const imgWidth = (el.width / 100) * width;
                            const imgHeight = (el.height / 100) * height;

                            page.drawImage(image, {
                                x,
                                y: y - imgHeight,
                                width: imgWidth,
                                height: imgHeight
                            });
                        }
                    } catch (e) {
                        console.error('Failed to embed image:', e);
                    }
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited_${file.name}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Failed to save PDF. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    return (
        <div className="flex h-full">
            <div className="w-80 border-r bg-background p-4 space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant={tool === 'select' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTool('select')}
                        >
                            <Move className="w-4 h-4 mr-1" />
                            Select
                        </Button>
                        <Button variant="outline" size="sm" onClick={addText}>
                            <Type className="w-4 h-4 mr-1" />
                            Text
                        </Button>
                        <Button variant="outline" size="sm" onClick={addRect}>
                            <Square className="w-4 h-4 mr-1" />
                            Shape
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="w-4 h-4 mr-1" />
                            Image
                        </Button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>

                {selectedElement && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold">Properties</h3>
                        
                        {selectedElement.type === 'text' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium">Text</label>
                                    <textarea
                                        value={selectedElement.content || ''}
                                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded text-sm"
                                        rows={3}
                                        placeholder="Enter text..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Font</label>
                                    <select
                                        value={selectedElement.fontFamily || 'Helvetica'}
                                        onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded text-sm"
                                    >
                                        {AVAILABLE_FONTS.map(font => (
                                            <option key={font.value} value={font.value}>
                                                {font.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Size</label>
                                    <input
                                        type="number"
                                        value={selectedElement.fontSize || 16}
                                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}
                                        className="w-full mt-1 p-2 border rounded text-sm"
                                        min="8"
                                        max="72"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={selectedElement.isBold ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => updateElement(selectedElement.id, { isBold: !selectedElement.isBold })}
                                    >
                                        <Bold className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={selectedElement.isItalic ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => updateElement(selectedElement.id, { isItalic: !selectedElement.isItalic })}
                                    >
                                        <Italic className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={selectedElement.isUnderline ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => updateElement(selectedElement.id, { isUnderline: !selectedElement.isUnderline })}
                                    >
                                        <Underline className="w-4 h-4" />
                                    </Button>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-sm font-medium">Color</label>
                            <input
                                type="color"
                                value={selectedElement.color || '#000000'}
                                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                className="w-full mt-1 h-10 border rounded cursor-pointer"
                            />
                        </div>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeElement(selectedElement.id)}
                            className="w-full"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                )}

                <div className="border-t pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || elements.length === 0}
                        className="w-full"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save PDF
                    </Button>
                    {elements.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Add elements to enable saving
                        </p>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {currentPage} of {numPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                                disabled={currentPage >= numPages}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                            >
                                -
                            </Button>
                            <span className="text-sm">{Math.round(scale * 100)}%</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setScale(Math.min(2, scale + 0.1))}
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    <div 
                        className="relative inline-block" 
                        ref={containerRef}
                        onMouseLeave={handleMouseUp}
                    >
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="border shadow-lg"
                        >
                            <Page
                                pageNumber={currentPage}
                                scale={scale}
                                className="relative"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>

                        {elements
                            .filter(el => el.page === currentPage)
                            .map(el => (
                                <div
                                    key={el.id}
                                    className={cn(
                                        "absolute cursor-move border-2 group",
                                        selectedId === el.id ? "border-blue-500" : "border-transparent hover:border-blue-300",
                                        el.type === 'text' && "min-w-[50px] min-h-[20px] flex items-center",
                                        el.type === 'rect' && "bg-opacity-70",
                                        isDragging && selectedId === el.id && "cursor-grabbing"
                                    )}
                                    style={{
                                        left: `${el.x}%`,
                                        top: `${el.y}%`,
                                        width: (el.type === 'rect' || el.type === 'image') ? `${el.width}%` : 'auto',
                                        height: (el.type === 'rect' || el.type === 'image') ? `${el.height}%` : 'auto',
                                        backgroundColor: el.type === 'rect' ? el.color : 'transparent',
                                        color: el.type === 'text' ? el.color : 'inherit',
                                        fontSize: el.type === 'text' ? `${(el.fontSize || 16) * scale}px` : undefined,
                                        fontFamily: el.type === 'text' ? el.fontFamily : undefined,
                                        fontWeight: el.type === 'text' && el.isBold ? 'bold' : 'normal',
                                        fontStyle: el.type === 'text' && el.isItalic ? 'italic' : 'normal',
                                        textDecoration: el.type === 'text' && el.isUnderline ? 'underline' : 'none',
                                        zIndex: selectedId === el.id ? 10 : 1
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(el.id);
                                    }}
                                >
                                    {el.type === 'text' && (
                                        <div className="px-1 py-0.5 min-w-[50px]">
                                            {el.content || 'Click to edit'}
                                        </div>
                                    )}
                                    {el.type === 'image' && el.image && (
                                        <img
                                            src={el.image}
                                            alt="Inserted image"
                                            className="w-full h-full object-contain pointer-events-none"
                                            draggable={false}
                                        />
                                    )}
                                    
                                    {/* Resize handles for rect and image */}
                                    {selectedId === el.id && (el.type === 'rect' || el.type === 'image') && (
                                        <>
                                            {/* Corner handles */}
                                            <div 
                                                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 'nw')}
                                            />
                                            <div 
                                                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 'ne')}
                                            />
                                            <div 
                                                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 'sw')}
                                            />
                                            <div 
                                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 'se')}
                                            />
                                            {/* Side handles */}
                                            <div 
                                                className="absolute top-1/2 -left-1 w-3 h-3 -mt-1.5 bg-blue-500 cursor-w-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 'w')}
                                            />
                                            <div 
                                                className="absolute top-1/2 -right-1 w-3 h-3 -mt-1.5 bg-blue-500 cursor-e-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 'e')}
                                            />
                                            <div 
                                                className="absolute -top-1 left-1/2 w-3 h-3 -ml-1.5 bg-blue-500 cursor-n-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 'n')}
                                            />
                                            <div 
                                                className="absolute -bottom-1 left-1/2 w-3 h-3 -ml-1.5 bg-blue-500 cursor-s-resize z-20" 
                                                onMouseDown={(e) => handleResizeStart(e, el.id, 's')}
                                            />
                                        </>
                                    )}
                                </div>
                            ))
                        }
                        
                        {/* Click to deselect */}
                        <div 
                            className="absolute inset-0 -z-10"
                            onClick={() => setSelectedId(null)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}