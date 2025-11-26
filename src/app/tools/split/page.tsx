"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { splitPDF } from "@/lib/pdf-utils";
import { Download, FileText, Scissors } from "lucide-react";
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

        // Get page count
        try {
            const buffer = await selectedFile.arrayBuffer();
            const pdf = await PDFDocument.load(buffer);
            setPageCount(pdf.getPageCount());
        } catch (e) {
            console.error("Error loading PDF", e);
        }
    };

    const parseRange = (range: string, max: number): number[] => {
        const pages: number[] = [];
        const parts = range.split(",");

        for (const part of parts) {
            if (part.includes("-")) {
                const [start, end] = part.split("-").map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= max) pages.push(i - 1); // 0-indexed
                    }
                }
            } else {
                const page = Number(part);
                if (!isNaN(page) && page >= 1 && page <= max) {
                    pages.push(page - 1);
                }
            }
        }
        return [...new Set(pages)].sort((a, b) => a - b);
    };

    const handleSplit = async () => {
        if (!file || !splitRange) return;
        setIsSplitting(true);

        try {
            const pageIndices = parseRange(splitRange, pageCount);

            if (pageIndices.length === 0) {
                alert("Invalid page range.");
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
        <div className="container max-w-2xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Split PDF</h1>
                <p className="text-muted-foreground">
                    Extract specific pages from your PDF document.
                </p>
            </div>

            {!file ? (
                <div className="h-64">
                    <PDFUploader onFileSelect={handleFileSelect} />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{pageCount} pages</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setFile(null); setSplitPdfUrl(null); }}>
                            Change
                        </Button>
                    </div>

                    <div className="space-y-4 p-6 border rounded-lg">
                        <div className="space-y-2">
                            <Label htmlFor="range">Page Range</Label>
                            <Input
                                id="range"
                                placeholder="e.g. 1, 3-5, 8"
                                value={splitRange}
                                onChange={(e) => setSplitRange(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter page numbers or ranges separated by commas.
                            </p>
                        </div>

                        <Button
                            onClick={handleSplit}
                            disabled={!splitRange || isSplitting}
                            className="w-full"
                        >
                            <Scissors className="mr-2 h-4 w-4" />
                            {isSplitting ? "Splitting..." : "Extract Pages"}
                        </Button>
                    </div>

                    {splitPdfUrl && (
                        <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-900 dark:text-green-100">Ready!</h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">Pages extracted successfully.</p>
                                </div>
                            </div>
                            <a href={splitPdfUrl} download={`split-${file.name}`}>
                                <Button className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
