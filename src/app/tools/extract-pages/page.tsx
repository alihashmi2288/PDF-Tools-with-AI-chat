"use client";

import { useState, useEffect } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractPdfPages } from "@/lib/pdf-page-utils";
import { 
    Scissors, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Check, 
    Layers, 
    FileArchive 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageThumbnail {
    pageIndex: number;
    dataUrl: string;
}

export default function ExtractPagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageThumbnail[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [rangeInput, setRangeInput] = useState("");
    const [exportAsZip, setExportAsZip] = useState(false);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setDownloadUrl(null);
        setSelectedIndices(new Set());
        setRangeInput("");
        setIsLoadingPreviews(true);

        try {
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: buffer }).promise;
            const items: PageThumbnail[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    items.push({
                        pageIndex: i - 1,
                        dataUrl: canvas.toDataURL('image/png'),
                    });
                }
            }
            setPages(items);
        } catch (e) {
            console.error("Failed to render page thumbnails", e);
        } finally {
            setIsLoadingPreviews(false);
        }
    };

    // Parse text range into set of page indices
    const parseRangeString = (text: string, maxPages: number): Set<number> => {
        const result = new Set<number>();
        const parts = text.split(/[\s,]+/);

        for (const part of parts) {
            if (!part) continue;
            if (part.includes('-')) {
                const [startStr, endStr] = part.split('-');
                const start = parseInt(startStr, 10);
                const end = parseInt(endStr, 10);
                if (!isNaN(start) && !isNaN(end)) {
                    const min = Math.max(1, Math.min(start, end));
                    const max = Math.min(maxPages, Math.max(start, end));
                    for (let p = min; p <= max; p++) {
                        result.add(p - 1);
                    }
                }
            } else {
                const p = parseInt(part, 10);
                if (!isNaN(p) && p >= 1 && p <= maxPages) {
                    result.add(p - 1);
                }
            }
        }
        return result;
    };

    // Format set of page indices into range string
    const formatRangeString = (indices: Set<number>): string => {
        const sorted = Array.from(indices).map(i => i + 1).sort((a, b) => a - b);
        if (sorted.length === 0) return "";

        const ranges: string[] = [];
        let start = sorted[0];
        let end = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === end + 1) {
                end = sorted[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = sorted[i];
                end = sorted[i];
            }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        return ranges.join(", ");
    };

    const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setRangeInput(val);
        const parsed = parseRangeString(val, pages.length);
        setSelectedIndices(parsed);
    };

    const togglePageSelection = (pageIndex: number) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(pageIndex)) {
                next.delete(pageIndex);
            } else {
                next.add(pageIndex);
            }
            setRangeInput(formatRangeString(next));
            return next;
        });
    };

    const applyPreset = (preset: 'odd' | 'even' | 'first-half') => {
        const next = new Set<number>();
        pages.forEach(p => {
            const num = p.pageIndex + 1;
            if (preset === 'odd' && num % 2 !== 0) next.add(p.pageIndex);
            if (preset === 'even' && num % 2 === 0) next.add(p.pageIndex);
            if (preset === 'first-half' && num <= Math.ceil(pages.length / 2)) next.add(p.pageIndex);
        });
        setSelectedIndices(next);
        setRangeInput(formatRangeString(next));
    };

    const handleExtract = async () => {
        if (!file || selectedIndices.size === 0) return;
        setIsExtracting(true);

        try {
            const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
            const buffer = await file.arrayBuffer();

            if (exportAsZip) {
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();
                const { PDFDocument } = await import('pdf-lib');
                const srcDoc = await PDFDocument.load(buffer);

                for (let i = 0; i < sortedIndices.length; i++) {
                    const idx = sortedIndices[i];
                    const singleDoc = await PDFDocument.create();
                    const [page] = await singleDoc.copyPages(srcDoc, [idx]);
                    singleDoc.addPage(page);
                    const bytes = await singleDoc.save();
                    zip.file(`Page_${idx + 1}.pdf`, bytes);
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                setDownloadUrl(URL.createObjectURL(zipBlob));
            } else {
                const outputBytes = await extractPdfPages(new Uint8Array(buffer), sortedIndices);
                const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
                setDownloadUrl(URL.createObjectURL(blob));
            }
        } catch (err) {
            console.error("Failed to extract pages", err);
            alert("Error extracting pages. Please try again.");
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium mb-1">
                    <Scissors className="h-3.5 w-3.5" />
                    Page Utility
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Extract PDF Pages</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Type a page range or click thumbnails to extract only the pages you need.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop your PDF here to extract pages"
                        subtitle="Upload any document to choose pages to pull out"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Control Panel */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setFile(null); setPages([]); setDownloadUrl(null); }}
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                    Choose New File
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Total: <strong>{pages.length}</strong> pages
                                </span>
                                <span className={cn(
                                    "text-xs font-semibold px-2.5 py-1 rounded-md",
                                    selectedIndices.size > 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-secondary text-muted-foreground"
                                )}>
                                    {selectedIndices.size} page{selectedIndices.size === 1 ? '' : 's'} selected
                                </span>
                            </div>

                            {/* Mode Toggle & Extract Button */}
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={exportAsZip}
                                        onChange={(e) => setExportAsZip(e.target.checked)}
                                        className="rounded border-border"
                                    />
                                    Separate PDFs (ZIP)
                                </label>
                                <Button
                                    onClick={handleExtract}
                                    disabled={selectedIndices.size === 0 || isExtracting}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                >
                                    {isExtracting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                            Extracting...
                                        </>
                                    ) : (
                                        <>
                                            <Scissors className="h-4 w-4 mr-1.5" />
                                            Extract {selectedIndices.size} Page{selectedIndices.size === 1 ? '' : 's'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Range Input & Presets */}
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
                            <div className="flex-1 min-w-[240px]">
                                <Label htmlFor="range" className="text-xs text-muted-foreground mb-1 block">
                                    Page Range (e.g., 1, 4-7, 12)
                                </Label>
                                <Input
                                    id="range"
                                    placeholder={`1, 3-${Math.min(5, pages.length)}`}
                                    value={rangeInput}
                                    onChange={handleRangeInputChange}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 self-end">
                                <Button variant="ghost" size="sm" onClick={() => applyPreset('odd')} className="text-xs h-9">
                                    Odd
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => applyPreset('even')} className="text-xs h-9">
                                    Even
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => applyPreset('first-half')} className="text-xs h-9">
                                    First Half
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedIndices(new Set(pages.map(p => p.pageIndex)));
                                        setRangeInput(formatRangeString(new Set(pages.map(p => p.pageIndex))));
                                    }}
                                    className="text-xs h-9"
                                >
                                    All
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSelectedIndices(new Set()); setRangeInput(""); }}
                                    className="text-xs h-9 text-muted-foreground"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Download Banner */}
                    {downloadUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Pages Extracted Successfully!</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedIndices.size} pages packaged into {exportAsZip ? "a ZIP of individual PDFs" : "a single clean PDF"}.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a
                                    href={downloadUrl}
                                    download={exportAsZip ? `${file.name.replace(/\.[^/.]+$/, '')}_extracted_pages.zip` : `${file.name.replace(/\.[^/.]+$/, '')}_extracted.pdf`}
                                >
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Extracted {exportAsZip ? "ZIP" : "PDF"}
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Grid */}
                    {isLoadingPreviews ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Rendering pages...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {pages.map((p) => {
                                const isSelected = selectedIndices.has(p.pageIndex);
                                return (
                                    <div
                                        key={p.pageIndex}
                                        onClick={() => togglePageSelection(p.pageIndex)}
                                        className={cn(
                                            "relative group border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 p-2 flex flex-col items-center bg-card hover:shadow-md",
                                            isSelected
                                                ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20"
                                                : "border-border/80 hover:border-foreground/30 opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <div className="w-full flex items-center justify-between pb-1.5 px-1">
                                            <span className="text-[11px] font-semibold text-foreground">
                                                Page {p.pageIndex + 1}
                                            </span>
                                            <div className={cn(
                                                "h-4 w-4 rounded flex items-center justify-center transition-colors",
                                                isSelected ? "bg-emerald-500 text-white" : "border border-border/80"
                                            )}>
                                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                            </div>
                                        </div>

                                        <div className="relative w-full aspect-[3/4] bg-white rounded border border-border/40 overflow-hidden flex items-center justify-center">
                                            <img
                                                src={p.dataUrl}
                                                alt={`Page ${p.pageIndex + 1}`}
                                                className="w-full h-full object-contain pointer-events-none"
                                            />
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
