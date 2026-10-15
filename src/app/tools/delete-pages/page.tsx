"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { deletePdfPages } from "@/lib/pdf-page-utils";
import { 
    Trash2, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    AlertCircle, 
    ShieldCheck, 
    Sparkles, 
    Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageThumbnail {
    pageIndex: number; // 0-indexed
    dataUrl: string;
}

export default function DeletePagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageThumbnail[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setResultPdfUrl(null);
        setSelectedIndices(new Set());
        setIsLoadingPreviews(true);

        try {
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: buffer }).promise;
            const previews: PageThumbnail[] = [];

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

    const togglePageDeletion = (pageIndex: number) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(pageIndex)) {
                next.delete(pageIndex);
            } else {
                next.add(pageIndex);
            }
            return next;
        });
    };

    const selectOdd = () => {
        const next = new Set<number>();
        pages.forEach(p => {
            if ((p.pageIndex + 1) % 2 !== 0) next.add(p.pageIndex);
        });
        setSelectedIndices(next);
    };

    const selectEven = () => {
        const next = new Set<number>();
        pages.forEach(p => {
            if ((p.pageIndex + 1) % 2 === 0) next.add(p.pageIndex);
        });
        setSelectedIndices(next);
    };

    const selectAll = () => {
        setSelectedIndices(new Set(pages.map(p => p.pageIndex)));
    };

    const resetSelection = () => {
        setSelectedIndices(new Set());
    };

    const invertSelection = () => {
        setSelectedIndices(prev => {
            const next = new Set<number>();
            pages.forEach(p => {
                if (!prev.has(p.pageIndex)) next.add(p.pageIndex);
            });
            return next;
        });
    };

    const handleDelete = async () => {
        if (!file || selectedIndices.size === 0) return;
        if (selectedIndices.size >= pages.length) {
            alert("You cannot delete all pages of the document.");
            return;
        }

        setIsProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const outputBytes = await deletePdfPages(new Uint8Array(buffer), Array.from(selectedIndices));
            const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
            setResultPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("Failed to delete pages", err);
            alert("Error deleting pages. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const remainingPagesCount = pages.length - selectedIndices.size;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium mb-1">
                    <Trash2 className="h-3.5 w-3.5" />
                    Page Utility
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Delete PDF Pages</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Click unwanted pages in the visual grid below to remove them cleanly from your document.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop your PDF here to remove pages"
                        subtitle="Upload any document — 100% private in-browser processing"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Control Bar */}
                    <div className="bg-card border border-border/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setPages([]); setSelectedIndices(new Set()); setResultPdfUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                Total: <strong>{pages.length}</strong> pages
                            </span>
                            <span className={cn(
                                "text-xs font-semibold px-2.5 py-1 rounded-md transition-colors",
                                selectedIndices.size > 0 
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                    : "bg-secondary text-muted-foreground"
                            )}>
                                {selectedIndices.size} marked for deletion ({remainingPagesCount} will remain)
                            </span>
                        </div>

                        {/* Quick Selection Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={selectOdd} className="text-xs h-8">
                                Odd Pages
                            </Button>
                            <Button variant="ghost" size="sm" onClick={selectEven} className="text-xs h-8">
                                Even Pages
                            </Button>
                            <Button variant="ghost" size="sm" onClick={invertSelection} className="text-xs h-8">
                                Invert
                            </Button>
                            <Button variant="ghost" size="sm" onClick={resetSelection} className="text-xs h-8 text-muted-foreground">
                                Reset
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={selectedIndices.size === 0 || remainingPagesCount === 0 || isProcessing}
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white font-medium"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                        Delete {selectedIndices.size} Page{selectedIndices.size === 1 ? '' : 's'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Result Download Banner */}
                    {resultPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Clean PDF Ready!</p>
                                    <p className="text-xs text-muted-foreground">
                                        Removed {selectedIndices.size} page{selectedIndices.size === 1 ? '' : 's'}. New document has {remainingPagesCount} pages.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={resultPdfUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_cleaned.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Clean PDF
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Page Grid */}
                    {isLoadingPreviews ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Rendering page thumbnails...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {pages.map((p) => {
                                const isMarked = selectedIndices.has(p.pageIndex);
                                return (
                                    <div
                                        key={p.pageIndex}
                                        onClick={() => togglePageDeletion(p.pageIndex)}
                                        className={cn(
                                            "relative group border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 p-2 flex flex-col items-center bg-card hover:shadow-md",
                                            isMarked
                                                ? "border-red-500 bg-red-500/5 ring-2 ring-red-500/20 opacity-75"
                                                : "border-border/80 hover:border-foreground/30"
                                        )}
                                    >
                                        {/* Status Badge */}
                                        <div className="w-full flex items-center justify-between pb-1.5 px-1">
                                            <span className={cn(
                                                "text-[11px] font-semibold",
                                                isMarked ? "line-through text-red-500" : "text-muted-foreground"
                                            )}>
                                                Page {p.pageIndex + 1}
                                            </span>
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                isMarked 
                                                    ? "bg-red-500 text-white" 
                                                    : "bg-secondary text-muted-foreground group-hover:bg-red-500/10 group-hover:text-red-500"
                                            )}>
                                                {isMarked ? "Delete" : "Keep"}
                                            </span>
                                        </div>

                                        {/* Thumbnail Image */}
                                        <div className="relative w-full aspect-[3/4] bg-white rounded border border-border/40 overflow-hidden flex items-center justify-center">
                                            <img
                                                src={p.dataUrl}
                                                alt={`Page ${p.pageIndex + 1}`}
                                                className={cn(
                                                    "w-full h-full object-contain transition-all",
                                                    isMarked && "filter grayscale opacity-40"
                                                )}
                                            />
                                            {isMarked && (
                                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                    <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                                                        <Trash2 className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
