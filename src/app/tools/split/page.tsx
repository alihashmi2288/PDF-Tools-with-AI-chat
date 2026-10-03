"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { splitPDF } from "@/lib/pdf-utils";
import { Download, FileText, Scissors, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { PDFDocument } from 'pdf-lib';

export default function SplitPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [splitRange, setSplitRange] = useState("");
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setSplitPdfUrl(null);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const pdf = await PDFDocument.load(buffer);
            setPageCount(pdf.getPageCount());
        } catch (e) {
            console.error("Error reading PDF pages", e);
        }
    };

    const parseRange = (range: string, max: number): number[] => {
        const pages: number[] = [];
        const parts = range.split(",");

        for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes("-")) {
                const [start, end] = trimmed.split("-").map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= max) pages.push(i - 1);
                    }
                }
            } else {
                const page = Number(trimmed);
                if (!isNaN(page) && page >= 1 && page <= max) {
                    pages.push(page - 1);
                }
            }
        }
        return [...new Set(pages)].sort((a, b) => a - b);
    };

    const setPreset = (type: "odd" | "even" | "first-half" | "all") => {
        if (pageCount === 0) return;
        if (type === "odd") {
            const odds = [];
            for (let i = 1; i <= pageCount; i += 2) odds.push(i);
            setSplitRange(odds.join(", "));
        } else if (type === "even") {
            const evens = [];
            for (let i = 2; i <= pageCount; i += 2) evens.push(i);
            setSplitRange(evens.join(", "));
        } else if (type === "first-half") {
            const half = Math.ceil(pageCount / 2);
            setSplitRange(`1-${half}`);
        } else if (type === "all") {
            setSplitRange(`1-${pageCount}`);
        }
    };

    const handleSplit = async () => {
        if (!file || !splitRange) return;
        setIsSplitting(true);

        try {
            const pageIndices = parseRange(splitRange, pageCount);

            if (pageIndices.length === 0) {
                alert("Please specify a valid page range within 1 to " + pageCount);
                setIsSplitting(false);
                return;
            }

            const buffer = await file.arrayBuffer();
            const splitBytes = await splitPDF(new Uint8Array(buffer), pageIndices);

            const blob = new Blob([splitBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setSplitPdfUrl(url);
        } catch (error) {
            console.error("Split failed:", error);
            alert("Failed to split PDF.");
        } finally {
            setIsSplitting(false);
        }
    };

    return (
        <div className="max-w-3xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                            <Scissors className="h-4 w-4 text-foreground" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Split & Slice PDF
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Extract specific page ranges, odd/even sequences, or individual sheets.
                    </p>
                </div>
            </div>

            {!file ? (
                <div className="max-w-xl mx-auto py-4">
                    <PDFUploader 
                        onFileSelect={handleFileSelect} 
                        title="Select PDF document to extract pages"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Document Meta Ribbon */}
                    <div className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl bg-card shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center border border-border/60">
                                <FileText className="h-4.5 w-4.5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground tabular-nums">
                                    Total Document Length: <span className="font-bold text-foreground">{pageCount}</span> pages
                                </p>
                            </div>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => { setFile(null); setSplitPdfUrl(null); }}
                        >
                            Change File
                        </Button>
                    </div>

                    {/* Range Selection Card */}
                    <div className="p-6 border border-border/70 rounded-xl bg-card space-y-5 shadow-xs">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="range" className="text-xs font-semibold text-foreground">
                                    Page Range Expression
                                </Label>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                    Valid index: 1 to {pageCount}
                                </span>
                            </div>
                            <Input
                                id="range"
                                placeholder="e.g. 1-3, 5, 8-10"
                                value={splitRange}
                                onChange={(e) => setSplitRange(e.target.value)}
                                className="h-10 text-xs font-mono bg-secondary/40 border-border/80"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Use commas to separate individual pages and hyphens for continuous ranges.
                            </p>
                        </div>

                        {/* Presets */}
                        <div className="space-y-2 pt-2 border-t border-border/40">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Quick Sequence Presets
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => setPreset("odd")}
                                >
                                    Odd Pages (1, 3, 5...)
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => setPreset("even")}
                                >
                                    Even Pages (2, 4, 6...)
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => setPreset("first-half")}
                                >
                                    First Half (1-{Math.ceil(pageCount / 2)})
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={handleSplit}
                            disabled={!splitRange.trim() || isSplitting}
                            className="w-full text-xs h-10 gap-2 font-medium"
                        >
                            {isSplitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Extracting Specified Pages...
                                </>
                            ) : (
                                <>
                                    <Scissors className="h-4 w-4" />
                                    Extract Selected Pages
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Result */}
                    {splitPdfUrl && (
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-foreground">Extraction Complete</h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Specified page ranges extracted into a new PDF document.
                                    </p>
                                </div>
                            </div>
                            <a href={splitPdfUrl} download={`split-${file.name}`} className="self-end sm:self-auto">
                                <Button size="sm" className="gap-2 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Download className="h-3.5 w-3.5" />
                                    Download Extracted PDF
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
