"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { convertPdfToImages, packageImagesAsZip, RenderedImagePage } from "@/lib/converters/pdf-to-images";
import { 
    Download, 
    Image as ImageIcon, 
    Archive, 
    Sliders, 
    CheckCircle2, 
    Loader2, 
    Eye, 
    RefreshCw, 
    Sparkles, 
    Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PdfToImagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState<'png' | 'jpeg'>('png');
    const [scale, setScale] = useState<number>(2.0); // 2x high resolution
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [images, setImages] = useState<RenderedImagePage[]>([]);
    const [isZipping, setIsZipping] = useState(false);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setImages([]);
        setProgress(0);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);
        setProgress(5);

        try {
            const results = await convertPdfToImages(
                file,
                { format, scale },
                (current, total) => {
                    setProgress(Math.round((current / total) * 100));
                }
            );
            setImages(results);
        } catch (error) {
            console.error("Conversion failed:", error);
            alert("Failed to convert PDF pages to images.");
        } finally {
            setIsConverting(false);
        }
    };

    const downloadSingleImage = (img: RenderedImagePage) => {
        const ext = format === 'jpeg' ? 'jpg' : 'png';
        const link = document.createElement('a');
        link.href = img.dataUrl;
        link.download = `${file?.name.replace('.pdf', '') || 'page'}_page_${img.pageNumber}.${ext}`;
        link.click();
    };

    const downloadAllAsZip = async () => {
        if (images.length === 0) return;
        setIsZipping(true);
        try {
            const baseName = file?.name.replace('.pdf', '') || 'document';
            const zipBlob = await packageImagesAsZip(images, baseName, format);
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${baseName}_images.zip`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("ZIP creation failed:", error);
            alert("Failed to create ZIP file.");
        } finally {
            setIsZipping(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                        <ImageIcon className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Convert PDF to JPG &amp; PNG
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Extract crisp, high-resolution images from every page of your PDF with 1-click single or ZIP download.
                </p>
            </div>

            {/* File Dropzone */}
            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop your PDF here to extract images"
                    subtitle="Fast in-browser rendering • No uploads to external servers"
                />
            ) : (
                <div className="space-y-6">
                    {/* Controls Card */}
                    <div className="p-5 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2.5">
                                <Layers className="h-4 w-4 text-purple-500" />
                                <span className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </span>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto cursor-pointer"
                                onClick={() => {
                                    setFile(null);
                                    setImages([]);
                                }}
                            >
                                Change Document
                            </Button>
                        </div>

                        {/* Format & Quality Toggles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">
                                    Image Format
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormat('png')}
                                        className={cn(
                                            "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer",
                                            format === 'png'
                                                ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                                : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                        )}
                                    >
                                        PNG (Lossless &amp; Sharp)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormat('jpeg')}
                                        className={cn(
                                            "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer",
                                            format === 'jpeg'
                                                ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                                : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                        )}
                                    >
                                        JPG (Smaller Size)
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">
                                    Resolution &amp; Quality
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setScale(1.5)}
                                        className={cn(
                                            "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer",
                                            scale === 1.5
                                                ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                                : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                        )}
                                    >
                                        Standard (150 DPI)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScale(2.5)}
                                        className={cn(
                                            "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer",
                                            scale === 2.5
                                                ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                                : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                        )}
                                    >
                                        Ultra HD (300 DPI)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Convert CTA */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <Button
                                onClick={handleConvert}
                                disabled={isConverting}
                                className="w-full sm:w-auto h-9 text-xs font-semibold gap-2 cursor-pointer"
                            >
                                {isConverting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Rendering Pages ({progress}%)...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Convert All Pages to {format.toUpperCase()}</span>
                                    </>
                                )}
                            </Button>

                            {images.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={downloadAllAsZip}
                                    disabled={isZipping}
                                    className="w-full sm:w-auto h-9 text-xs font-semibold gap-2 cursor-pointer border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                                >
                                    {isZipping ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Archive className="h-3.5 w-3.5" />
                                    )}
                                    <span>Download All ({images.length}) as ZIP</span>
                                </Button>
                            )}
                        </div>

                        {isConverting && (
                            <div className="space-y-1.5 pt-2">
                                <Progress value={progress} className="h-1.5" />
                                <p className="text-[11px] text-muted-foreground text-center">
                                    Rendering high-resolution page rasterizers in your browser...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Results Grid */}
                    {images.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>{images.length} Pages Converted</span>
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    Click any image to save directly
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map((img) => (
                                    <div
                                        key={img.pageNumber}
                                        className="group rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs hover:border-purple-500/50 transition-all flex flex-col justify-between"
                                    >
                                        <div className="relative aspect-[3/4] bg-secondary/30 p-2 flex items-center justify-center overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={img.dataUrl}
                                                alt={`Page ${img.pageNumber}`}
                                                className="max-h-full max-w-full object-contain shadow-xs group-hover:scale-[1.02] transition-transform"
                                            />
                                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-background/80 backdrop-blur-md border border-border/60">
                                                Page {img.pageNumber}
                                            </div>
                                        </div>

                                        <div className="p-3 border-t border-border/40 flex items-center justify-between gap-2 bg-secondary/10">
                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {img.width} × {img.height}px
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-7 text-xs gap-1.5 cursor-pointer"
                                                onClick={() => downloadSingleImage(img)}
                                            >
                                                <Download className="h-3 w-3" />
                                                <span>Save {format.toUpperCase()}</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
