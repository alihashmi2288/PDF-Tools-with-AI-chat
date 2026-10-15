"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { extractPdfBookmarks, splitPdfByBookmarks, BookmarkChapter } from "@/lib/pdf-page-utils";
import { 
    Bookmark, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    FileText, 
    FileArchive, 
    Layers, 
    AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SplitByBookmarksPage() {
    const [file, setFile] = useState<File | null>(null);
    const [chapters, setChapters] = useState<BookmarkChapter[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSplitting, setIsSplitting] = useState(false);
    const [hasNoBookmarks, setHasNoBookmarks] = useState(false);
    const [downloadZipUrl, setDownloadZipUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setDownloadZipUrl(null);
        setHasNoBookmarks(false);
        setIsAnalyzing(true);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const extracted = await extractPdfBookmarks(new Uint8Array(buffer));

            if (extracted.length === 0) {
                setHasNoBookmarks(true);
                // Create fallback chapters (every 5 pages or based on total page count)
                const { PDFDocument } = await import('pdf-lib');
                const doc = await PDFDocument.load(buffer);
                const total = doc.getPageCount();
                const chunkSize = 5;
                const fallbackList: BookmarkChapter[] = [];

                for (let i = 0; i < total; i += chunkSize) {
                    const start = i + 1;
                    const end = Math.min(i + chunkSize, total);
                    fallbackList.push({
                        title: `Section ${Math.floor(i / chunkSize) + 1} (Pages ${start}-${end})`,
                        startPage: start,
                        endPage: end,
                        pageCount: end - start + 1,
                    });
                }
                setChapters(fallbackList);
                setSelectedIndices(new Set(fallbackList.map((_, idx) => idx)));
            } else {
                setChapters(extracted);
                setSelectedIndices(new Set(extracted.map((_, idx) => idx)));
            }
        } catch (e) {
            console.error("Failed to extract bookmarks", e);
            alert("Could not read document bookmarks.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleChapter = (index: number) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIndices(new Set(chapters.map((_, i) => i)));
    };

    const deselectAll = () => {
        setSelectedIndices(new Set());
    };

    const handleSplit = async () => {
        if (!file || selectedIndices.size === 0) return;
        setIsSplitting(true);

        try {
            const chosenChapters = chapters.filter((_, idx) => selectedIndices.has(idx));
            const buffer = await file.arrayBuffer();
            const zipBytes = await splitPdfByBookmarks(new Uint8Array(buffer), chosenChapters);

            const blob = new Blob([zipBytes as any], { type: 'application/zip' });
            setDownloadZipUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("Split by bookmarks failed", err);
            alert("Failed to split chapters. Please try again.");
        } finally {
            setIsSplitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium mb-1">
                    <Bookmark className="h-3.5 w-3.5" />
                    Chapter Splitting
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Split PDF by Bookmarks / Outlines</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Automatically detect chapters, sections, and bookmarks in your document and split them into separate chapter PDFs packed in a ZIP archive.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop book or handbook to split by chapters"
                        subtitle="Upload textbooks, documentation, whitepapers, or manuals"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Control Bar */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setFile(null); setChapters([]); setDownloadZipUrl(null); }}
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                    Choose New File
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Found <strong>{chapters.length}</strong> {hasNoBookmarks ? "sections (auto-chunked)" : "chapters"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-8">
                                    Select All
                                </Button>
                                <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-8 text-muted-foreground">
                                    Deselect All
                                </Button>
                                <Button
                                    onClick={handleSplit}
                                    disabled={selectedIndices.size === 0 || isSplitting}
                                    size="sm"
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
                                >
                                    {isSplitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                            Splitting Chapters...
                                        </>
                                    ) : (
                                        <>
                                            <FileArchive className="h-4 w-4 mr-1.5" />
                                            Export {selectedIndices.size} Chapter{selectedIndices.size === 1 ? '' : 's'} (ZIP)
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {hasNoBookmarks && (
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>This PDF does not contain an embedded table of contents. We have automatically partitioned it into sections for you.</span>
                            </div>
                        )}
                    </div>

                    {/* Download Banner */}
                    {downloadZipUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Chapters Split Successfully!</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedIndices.size} chapter PDFs bundled in a single ZIP download.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={downloadZipUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_chapters.zip`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Chapters (ZIP)
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Chapters List */}
                    {isAnalyzing ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Reading bookmarks and chapter structure...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {chapters.map((ch, idx) => {
                                const isChecked = selectedIndices.has(idx);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleChapter(idx)}
                                        className={cn(
                                            "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all bg-card",
                                            isChecked 
                                                ? "border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20" 
                                                : "border-border/80 hover:border-foreground/30 opacity-70"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}} // Controlled by div click
                                                className="rounded border-border accent-rose-600 h-4 w-4"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Pages {ch.startPage} – {ch.endPage} ({ch.pageCount} page{ch.pageCount === 1 ? '' : 's'})
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                                            {String(idx + 1).padStart(2, '0')}.pdf
                                        </span>
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
