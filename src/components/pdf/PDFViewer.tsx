"use client";

import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { 
    ChevronLeft, 
    ChevronRight, 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    Maximize2, 
    Download, 
    Printer,
    FileText,
    Minimize2
} from "lucide-react";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
    file: File | string | null;
}

export function PDFViewer({ file }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [rotation, setRotation] = useState<number>(0);
    const [pageInput, setPageInput] = useState<string>("1");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const viewerContainerRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
        setPageInput("1");
    }

    const changePage = (newPage: number) => {
        const clamped = Math.max(1, Math.min(newPage, numPages || 1));
        setPageNumber(clamped);
        setPageInput(clamped.toString());
    };

    const previousPage = () => changePage(pageNumber - 1);
    const nextPage = () => changePage(pageNumber + 1);

    const zoomIn = () => setScale((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.5));
    const zoomOut = () => setScale((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.5));
    const resetZoom = () => setScale(1.0);

    const rotateClockwise = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const parsed = parseInt(pageInput, 10);
            if (!isNaN(parsed)) {
                changePage(parsed);
            } else {
                setPageInput(pageNumber.toString());
            }
        }
    };

    const toggleFullscreen = () => {
        if (!viewerContainerRef.current) return;
        if (!document.fullscreenElement) {
            viewerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    const handleDownload = () => {
        if (!file) return;
        if (file instanceof File) {
            const url = URL.createObjectURL(file);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (typeof file === "string") {
            const a = document.createElement("a");
            a.href = file;
            a.download = "document.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handlePrint = () => {
        if (!file) return;
        let url = "";
        if (file instanceof File) {
            url = URL.createObjectURL(file);
        } else if (typeof file === "string") {
            url = file;
        }
        if (url) {
            const printWindow = window.open(url, "_blank");
            if (printWindow) {
                printWindow.addEventListener("load", () => {
                    printWindow.print();
                });
            }
        }
    };

    if (!file) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-2">
                <FileText className="h-10 w-10 stroke-[1.5] text-muted-foreground/60" />
                <p className="text-sm font-medium">No document loaded</p>
                <p className="text-xs">Upload a PDF to view and analyze its contents.</p>
            </div>
        );
    }

    return (
        <div ref={viewerContainerRef} className="flex flex-col h-full w-full bg-muted/20">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-2 border-b border-border/60 bg-background/80 backdrop-blur-xs shrink-0 select-none">
                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                        title="Previous page (Left arrow)"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                        <input
                            type="text"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={handlePageInputSubmit}
                            onBlur={() => setPageInput(pageNumber.toString())}
                            className="w-10 h-6 text-center text-xs font-mono rounded bg-secondary/70 border border-border/60 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span>/</span>
                        <span className="tabular-nums">{numPages || 1}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        disabled={pageNumber >= numPages}
                        onClick={nextPage}
                        title="Next page (Right arrow)"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Zoom & View Controls */}
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                        onClick={zoomOut}
                        title="Zoom out"
                    >
                        <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    <button 
                        onClick={resetZoom}
                        title="Reset to 100%"
                        className="text-xs font-mono px-1.5 py-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground tabular-nums transition-colors"
                    >
                        {Math.round(scale * 100)}%
                    </button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                        onClick={zoomIn}
                        title="Zoom in"
                    >
                        <ZoomIn className="h-3.5 w-3.5" />
                    </Button>

                    <div className="w-px h-4 bg-border/60 mx-1" />

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                        onClick={rotateClockwise}
                        title="Rotate view clockwise (90°)"
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                        onClick={toggleFullscreen}
                        title="Toggle full screen reading mode"
                    >
                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </Button>
                </div>

                {/* Download & Print */}
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                        onClick={handlePrint}
                        title="Print document"
                    >
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                        onClick={handleDownload}
                        title="Download PDF"
                    >
                        <Download className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Document Render Canvas */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 bg-muted/30">
                <div className="border border-border/70 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-card transition-transform duration-150">
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="p-12 text-center text-xs font-mono text-muted-foreground">
                                Rendering document pages...
                            </div>
                        }
                        className="max-w-full"
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-xs"
                        />
                    </Document>
                </div>
            </div>
        </div>
    );
}
