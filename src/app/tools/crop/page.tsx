"use client";

import { useState, useRef, useEffect } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cropPdfPages } from "@/lib/pdf-page-utils";
import { 
    Crop, 
    Download, 
    CheckCircle2, 
    Loader2, 
    ChevronLeft, 
    ChevronRight, 
    Layers, 
    Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CropPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [pageImageDataUrl, setPageImageDataUrl] = useState<string | null>(null);
    const [rawPageDimensions, setRawPageDimensions] = useState({ width: 595, height: 842 });
    const [isLoadingPage, setIsLoadingPage] = useState(false);

    // Crop box percentages (left, top, width, height from 0 to 100)
    const [cropPercent, setCropPercent] = useState({
        left: 5,
        top: 5,
        width: 90,
        height: 90,
    });

    const [applyToAll, setApplyToAll] = useState(true);
    const [isCropping, setIsCropping] = useState(false);
    const [croppedPdfUrl, setCroppedPdfUrl] = useState<string | null>(null);

    const renderPage = async (fileObj: File, pageIdx: number) => {
        setIsLoadingPage(true);
        try {
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await fileObj.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: buffer }).promise;
            setPageCount(pdf.numPages);

            const page = await pdf.getPage(pageIdx + 1);
            const rawViewport = page.getViewport({ scale: 1.0 });
            setRawPageDimensions({ width: rawViewport.width, height: rawViewport.height });

            const previewViewport = page.getViewport({ scale: 1.2 });
            const canvas = document.createElement('canvas');
            canvas.width = previewViewport.width;
            canvas.height = previewViewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport: previewViewport }).promise;
                setPageImageDataUrl(canvas.toDataURL('image/png'));
            }
        } catch (e) {
            console.error("Failed to render page for crop preview", e);
        } finally {
            setIsLoadingPage(false);
        }
    };

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setCurrentPageIndex(0);
        setCroppedPdfUrl(null);
        await renderPage(selectedFile, 0);
    };

    const changePage = async (offset: number) => {
        if (!file) return;
        const newPage = Math.max(0, Math.min(pageCount - 1, currentPageIndex + offset));
        setCurrentPageIndex(newPage);
        await renderPage(file, newPage);
    };

    const applyPreset = (preset: 'trim-5' | 'trim-10' | 'trim-15' | 'reset') => {
        if (preset === 'trim-5') {
            setCropPercent({ left: 5, top: 5, width: 90, height: 90 });
        } else if (preset === 'trim-10') {
            setCropPercent({ left: 10, top: 10, width: 80, height: 80 });
        } else if (preset === 'trim-15') {
            setCropPercent({ left: 15, top: 15, width: 70, height: 70 });
        } else {
            setCropPercent({ left: 0, top: 0, width: 100, height: 100 });
        }
    };

    const handleCrop = async () => {
        if (!file) return;
        setIsCropping(true);

        try {
            // Convert percentage crop box to PDF coordinate space
            // In PDF points: (0, 0) is bottom-left
            const boxWidth = (cropPercent.width / 100) * rawPageDimensions.width;
            const boxHeight = (cropPercent.height / 100) * rawPageDimensions.height;
            const x = (cropPercent.left / 100) * rawPageDimensions.width;
            const y = rawPageDimensions.height - ((cropPercent.top / 100) * rawPageDimensions.height) - boxHeight;

            const buffer = await file.arrayBuffer();
            const resultBytes = await cropPdfPages(new Uint8Array(buffer), {
                allPages: applyToAll,
                targetPageIndex: currentPageIndex,
                cropBox: { x, y, width: boxWidth, height: boxHeight },
            });

            const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setCroppedPdfUrl(url);
        } catch (err) {
            console.error("Crop failed:", err);
            alert("Failed to crop PDF.");
        } finally {
            setIsCropping(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
                        <Crop className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Crop PDF Pages
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Trim unwanted page margins, crop headers/footers, or resize page dimensions visually.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop PDF to crop margins"
                    subtitle="Visual interactive crop box with 1-click trim presets"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Controls (4 cols) */}
                    <div className="md:col-span-4 space-y-4">
                        <div className="p-4 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs">
                            <div className="border-b border-border/40 pb-2.5">
                                <p className="font-semibold text-xs text-foreground truncate">
                                    {file.name}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground">
                                    {pageCount} Pages • {rawPageDimensions.width} × {rawPageDimensions.height} pts
                                </p>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">
                                    Quick Margin Presets
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs cursor-pointer"
                                        onClick={() => applyPreset('trim-5')}
                                    >
                                        Trim 5% Margins
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs cursor-pointer"
                                        onClick={() => applyPreset('trim-10')}
                                    >
                                        Trim 10% Margins
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs cursor-pointer"
                                        onClick={() => applyPreset('trim-15')}
                                    >
                                        Trim 15% Margins
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs cursor-pointer"
                                        onClick={() => applyPreset('reset')}
                                    >
                                        Reset to Full
                                    </Button>
                                </div>
                            </div>

                            {/* Scope: Current page vs All pages */}
                            <div className="space-y-2 pt-2 border-t border-border/40">
                                <Label className="text-xs font-semibold text-foreground">
                                    Apply Scope
                                </Label>
                                <div className="space-y-1.5 text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="scope"
                                            checked={applyToAll}
                                            onChange={() => setApplyToAll(true)}
                                            className="text-teal-600"
                                        />
                                        <span>Apply crop to all {pageCount} pages</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="scope"
                                            checked={!applyToAll}
                                            onChange={() => setApplyToAll(false)}
                                            className="text-teal-600"
                                        />
                                        <span>Apply to Page {currentPageIndex + 1} only</span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleCrop}
                                disabled={isCropping}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white"
                            >
                                {isCropping ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Cropping Document...</span>
                                    </>
                                ) : (
                                    <>
                                        <Crop className="h-4 w-4" />
                                        <span>Crop PDF Document</span>
                                    </>
                                )}
                            </Button>

                            {croppedPdfUrl && (
                                <div className="pt-2 text-center">
                                    <a
                                        href={croppedPdfUrl}
                                        download={`${file.name.replace(/\.pdf$/i, '')}_cropped.pdf`}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download Cropped PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Box (8 cols) */}
                    <div className="md:col-span-8 space-y-4">
                        <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3 shadow-xs">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={currentPageIndex <= 0}
                                        onClick={() => changePage(-1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-mono font-medium">
                                        Page {currentPageIndex + 1} of {pageCount}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={currentPageIndex >= pageCount - 1}
                                        onClick={() => changePage(1)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <span className="text-[11px] text-muted-foreground">
                                    Selected Crop Area: {cropPercent.width}% × {cropPercent.height}%
                                </span>
                            </div>

                            <div className="relative border border-border/60 rounded-xl bg-secondary/30 min-h-[480px] flex items-center justify-center p-4 overflow-hidden select-none">
                                {isLoadingPage ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                                ) : pageImageDataUrl ? (
                                    <div className="relative shadow-md max-w-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={pageImageDataUrl}
                                            alt="Page preview"
                                            className="max-h-[640px] w-auto block pointer-events-none"
                                        />

                                        {/* Shaded Area outside crop box */}
                                        <div
                                            style={{
                                                left: `${cropPercent.left}%`,
                                                top: `${cropPercent.top}%`,
                                                width: `${cropPercent.width}%`,
                                                height: `${cropPercent.height}%`,
                                            }}
                                            className="absolute border-2 border-dashed border-teal-500 bg-teal-500/15 ring-9999 ring-black/40 pointer-events-none"
                                        >
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-teal-600 text-white text-[9px] font-mono">
                                                CROP BOUNDARY
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
