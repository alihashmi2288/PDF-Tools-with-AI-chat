"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    file: File | string | null;
}

export function PDFViewer({ file }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    const changePage = (offset: number) => {
        setPageNumber((prevPageNumber) => prevPageNumber + offset);
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.0));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

    if (!file) {
        return <div className="text-center p-10">No PDF loaded</div>;
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-4 mb-4 p-2 bg-secondary rounded-lg">
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={pageNumber <= 1}
                    onClick={previousPage}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                    Page {pageNumber} of {numPages}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={pageNumber >= numPages}
                    onClick={nextPage}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" size="icon" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-900">
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="max-w-full"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>
        </div>
    );
}
