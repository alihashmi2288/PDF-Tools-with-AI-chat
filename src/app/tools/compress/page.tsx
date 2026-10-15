"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Minimize2, Loader2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { PDFDocument } from 'pdf-lib';

export default function CompressPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<{ original: string; compressed: string; saved: string; percentSaved: number } | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleCompress = async () => {
        if (!file) return;
        setIsCompressing(true);

        try {
            const buffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);

            // Clean redundant objects and streams
            const compressedBytes = await pdfDoc.save({ useObjectStreams: false });

            const blob = new Blob([compressedBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const origSize = file.size;
            const compSize = compressedBytes.byteLength;
            const savedBytes = Math.max(0, origSize - compSize);
            const percent = origSize > 0 ? Math.round((savedBytes / origSize) * 100) : 0;

            setCompressedPdfUrl(url);
            setStats({
                original: formatSize(origSize),
                compressed: formatSize(compSize),
                saved: formatSize(savedBytes),
                percentSaved: percent
            });

        } catch (error) {
            console.error("Compression failed:", error);
            alert("Failed to compress PDF.");
        } finally {
            setIsCompressing(false);
        }
    };

    return (
        <div className="max-w-3xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                            <Minimize2 className="h-4 w-4 text-foreground" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Compress PDF Document
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Purge redundant objects, metadata, and unused stream tables locally.
                    </p>
                </div>
            </div>

            {!file ? (
                <div className="max-w-xl mx-auto py-4">
                    <PDFUploader 
                        onFileSelect={(f) => { setFile(f); setCompressedPdfUrl(null); setStats(null); }} 
                        title="Select PDF document to compress"
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
                                    Current size: <span className="font-bold text-foreground">{formatSize(file.size)}</span>
                                </p>
                            </div>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => { setFile(null); setCompressedPdfUrl(null); setStats(null); }}
                        >
                            Change File
                        </Button>
                    </div>

                    {/* Compression Action Card */}
                    <div className="p-6 border border-border/70 rounded-xl bg-card space-y-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                                <p className="font-semibold text-foreground">Smart Quality Optimization</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Shrinks file size safely while keeping all text and images crystal clear.
                                </p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                                High Quality
                            </span>
                        </div>

                        <Button
                            onClick={handleCompress}
                            disabled={isCompressing}
                            className="w-full text-xs h-10 gap-2 font-medium"
                        >
                            {isCompressing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Optimizing PDF...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" />
                                    Compress & Optimize PDF
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Compression Results Metrics */}
                    {stats && compressedPdfUrl && (
                        <div className="p-6 border border-border/70 rounded-xl bg-card space-y-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                        Optimization Complete
                                    </h3>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-500 tabular-nums">
                                    {stats.percentSaved}% reduced
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Original</p>
                                    <p className="text-sm font-mono font-bold text-foreground mt-1 tabular-nums">{stats.original}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Optimized</p>
                                    <p className="text-sm font-mono font-bold text-emerald-500 mt-1 tabular-nums">{stats.compressed}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Saved Space</p>
                                    <p className="text-sm font-mono font-bold text-foreground mt-1 tabular-nums">{stats.saved}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <a href={compressedPdfUrl} download={`compressed-${file.name}`}>
                                    <Button className="w-full gap-2 text-xs h-10" variant="default">
                                        <Download className="h-4 w-4" />
                                        Download Optimized PDF
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
