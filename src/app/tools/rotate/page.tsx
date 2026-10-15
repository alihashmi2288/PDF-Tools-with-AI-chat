"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { rotatePdfPages } from "@/lib/pdf-page-utils";
import { 
    RotateCw, 
    RotateCcw, 
    Download, 
    CheckCircle2, 
    Loader2, 
    Layers, 
    Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PagePreviewItem {
    pageIndex: number; // 0-indexed
    rotationDelta: number; // 0, 90, 180, 270
    dataUrl: string;
}

export default function RotatePagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PagePreviewItem[]>([]);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setRotatedPdfUrl(null);
        setIsLoadingPreviews(true);

        try {
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: buffer }).promise;
            const previews: PagePreviewItem[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    previews.push({
                        pageIndex: i - 1,
                        rotationDelta: 0,
                        dataUrl: canvas.toDataURL('image/png'),
                    });
                }
            }
            setPages(previews);
        } catch (e) {
            console.error("Failed to render page thumbnails", e);
        } finally {
            setIsLoadingPreviews(false);
        }
    };

    const rotateSinglePage = (pageIdx: number, angle: number) => {
        setPages(prev =>
            prev.map(p =>
                p.pageIndex === pageIdx
                    ? { ...p, rotationDelta: (p.rotationDelta + angle + 360) % 360 }
                    : p
            )
        );
    };

    const rotateAllPages = (angle: number) => {
        setPages(prev =>
            prev.map(p => ({
                ...p,
                rotationDelta: (p.rotationDelta + angle + 360) % 360,
            }))
        );
    };

    const handleSave = async () => {
        if (!file || pages.length === 0) return;
        setIsSaving(true);

        try {
            const rotationsMap: Record<number, number> = {};
            pages.forEach(p => {
                if (p.rotationDelta !== 0) {
                    rotationsMap[p.pageIndex] = p.rotationDelta;
                }
            });

            const buffer = await file.arrayBuffer();
            const resultBytes = await rotatePdfPages(new Uint8Array(buffer), rotationsMap);

            const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setRotatedPdfUrl(url);
        } catch (err) {
            console.error("Rotate error:", err);
            alert("Failed to rotate PDF.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <RotateCw className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Rotate PDF Pages
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Rotate upside-down or sideways pages clockwise, counter-clockwise, or 180° with live visual thumbnails.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop PDF to rotate pages"
                    subtitle="Interactive per-page and bulk rotation"
                />
            ) : (
                <div className="space-y-6">
                    {/* Bulk Action Ribbon */}
                    <div className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Layers className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="font-semibold text-xs text-foreground truncate max-w-xs sm:max-w-md">
                                    {file.name}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground">
                                    {pages.length} pages loaded
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1.5 cursor-pointer"
                                onClick={() => rotateAllPages(90)}
                            >
                                <RotateCw className="h-3.5 w-3.5" />
                                <span>Rotate All 90° CW</span>
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1.5 cursor-pointer"
                                onClick={() => rotateAllPages(-90)}
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Rotate All 90° CCW</span>
                            </Button>

                            <Button
                                size="sm"
                                className="h-8 text-xs gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Save Changes</span>
                            </Button>
                        </div>
                    </div>

                    {rotatedPdfUrl && (
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-semibold text-foreground">
                                    Pages rotated successfully!
                                </span>
                            </div>
                            <a
                                href={rotatedPdfUrl}
                                download={`${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`}
                            >
                                <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download PDF</span>
                                </Button>
                            </a>
                        </div>
                    )}

                    {/* Thumbnails Grid */}
                    {isLoadingPreviews ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            <span>Generating page thumbnails...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {pages.map((p) => (
                                <div
                                    key={p.pageIndex}
                                    className="p-2.5 rounded-xl border border-border/70 bg-card flex flex-col justify-between space-y-2 shadow-xs group"
                                >
                                    <div className="aspect-[3/4] bg-secondary/30 rounded-lg overflow-hidden flex items-center justify-center p-1 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={p.dataUrl}
                                            alt={`Page ${p.pageIndex + 1}`}
                                            className="max-h-full max-w-full object-contain transition-transform duration-300"
                                            style={{ transform: `rotate(${p.rotationDelta}deg)` }}
                                        />
                                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-background/80 border border-border/60">
                                            #{p.pageIndex + 1}
                                        </div>
                                        {p.rotationDelta !== 0 && (
                                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500 text-white font-bold">
                                                +{p.rotationDelta}°
                                            </div>
                                        )}
                                    </div>

                                    {/* Rotate Action Buttons */}
                                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/40">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                                            onClick={() => rotateSinglePage(p.pageIndex, -90)}
                                            title="Rotate 90° CCW"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                        </Button>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {p.rotationDelta}°
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                                            onClick={() => rotateSinglePage(p.pageIndex, 90)}
                                            title="Rotate 90° CW"
                                        >
                                            <RotateCw className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
