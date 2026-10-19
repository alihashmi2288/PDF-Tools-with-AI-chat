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
    Minimize2,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

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
            <div className="paper-empty-sheet flex flex-col items-center justify-center p-12 text-center m-6 space-y-3">
                <div className="h-12 w-12 rounded-[10px] bg-surface-2 border border-hairline flex items-center justify-center shadow-xs">
                    <FileText className="h-6 w-6 stroke-[1.5] text-ink-subtle" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink">No document loaded</p>
                    <p className="text-xs text-ink-subtle max-w-xs">Upload or drop a PDF to read, zoom, and inspect pages in the precision viewer.</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={viewerContainerRef} className="flex flex-col h-full w-full bg-surface-1">
            {/* Top Toolbar: Apple QuickLook Floating Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-2 border-b border-hairline bg-surface-1/80 backdrop-blur-xl shrink-0 select-none">
                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2"
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                        title="Previous page (Left arrow)"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 text-xs font-mono text-ink-subtle">
                        <input
                            type="text"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={handlePageInputSubmit}
                            onBlur={() => setPageInput(pageNumber.toString())}
                            className="w-10 h-6 text-center text-xs font-mono rounded-[6px] bg-surface-2 border border-hairline text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span>/</span>
                        <span className="tabular-nums text-ink">{numPages || 1}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2"
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
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2" 
                        onClick={zoomOut}
                        title="Zoom out"
                    >
                        <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    <button 
                        onClick={resetZoom}
                        title="Reset to 100%"
                        className="text-xs font-mono px-1.5 py-0.5 rounded-[4px] hover:bg-surface-2 text-ink-subtle hover:text-ink tabular-nums transition-colors"
                    >
                        {Math.round(scale * 100)}%
                    </button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2" 
                        onClick={zoomIn}
                        title="Zoom in"
                    >
                        <ZoomIn className="h-3.5 w-3.5" />
                    </Button>

                    <div className="w-px h-4 bg-hairline mx-1" />

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2" 
                        onClick={rotateClockwise}
                        title="Rotate view clockwise (90°)"
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2" 
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
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2" 
                        onClick={handlePrint}
                        title="Print document"
                    >
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-ink-subtle hover:text-ink hover:bg-surface-2" 
                        onClick={handleDownload}
                        title="Download PDF"
                    >
                        <Download className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Document Render Canvas: Paper Desk Mat & Tactile Sheet */}
            <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 sm:p-8 paper-desk-mat relative subtle-scrollbar">
                <div className={cn(
                    "paper-sheet transition-transform duration-150 relative my-auto",
                    numPages > 1 ? "paper-sheet-stacked" : ""
                )}>
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="p-16 text-center text-xs font-mono text-ink-subtle flex flex-col items-center gap-2.5">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span>Rendering high-fidelity document sheet...</span>
                            </div>
                        }
                        className="max-w-full rounded-[8px] overflow-hidden"
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-xs rounded-[8px] overflow-hidden"
                        />
                    </Document>
                </div>

                {/* Document Sheet Status Badge */}
                {numPages > 0 && (
                    <div className="sticky bottom-3 mt-4 z-10 pointer-events-none">
                        <div className="px-3.5 py-1 rounded-full bg-surface-1/90 backdrop-blur-md border border-hairline text-ink-subtle text-[11px] font-mono shadow-xs flex items-center gap-2">
                            <span className="text-ink font-medium">Sheet {pageNumber} of {numPages}</span>
                            <span className="text-hairline-strong">•</span>
                            <span>{Math.round(scale * 100)}% zoom</span>
                            {rotation !== 0 && (
                                <>
                                    <span className="text-hairline-strong">•</span>
                                    <span>{rotation}°</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
