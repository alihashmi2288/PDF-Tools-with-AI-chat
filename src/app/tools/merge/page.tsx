"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, X, Upload, Download, Combine, ArrowUp, ArrowDown, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { mergePDFs } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { useGlobalToolContext } from "@/context/GlobalToolContext";

export default function MergePage() {
    const { merge, setMerge } = useGlobalToolContext();
    const { files, isMerging, mergedPdfUrl } = merge;

    const onDrop = (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.filter(f => f.type === "application/pdf");
        setMerge({
            files: [...files, ...newFiles],
            mergedPdfUrl: null
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
    });

    const removeFile = (index: number) => {
        setMerge({
            files: files.filter((_, i) => i !== index),
            mergedPdfUrl: null
        });
    };

    const moveFile = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === files.length - 1)
        ) {
            return;
        }

        const newFiles = [...files];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];

        setMerge({
            files: newFiles,
            mergedPdfUrl: null
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleMerge = async () => {
        if (files.length < 2) return;
        setMerge({ isMerging: true });

        try {
            const fileBuffers = await Promise.all(
                files.map(file => file.arrayBuffer().then(buffer => new Uint8Array(buffer)))
            );

            const mergedPdfBytes = await mergePDFs(fileBuffers);
            const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setMerge({ mergedPdfUrl: url });
        } catch (error) {
            console.error("Merge failed:", error);
            alert("Failed to merge PDFs. Please try again.");
        } finally {
            setMerge({ isMerging: false });
        }
    };

    return (
        <div className="max-w-4xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                            <Combine className="h-4 w-4 text-foreground" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Merge PDF Documents
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Combine multiple PDF files into one continuous document. Reorder by sequence.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-secondary border border-border/50">
                        {files.length} {files.length === 1 ? "file" : "files"} in queue
                    </span>
                </div>
            </div>

            {/* Main Workbench Grid */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Upload Section (5 cols) */}
                <div className="md:col-span-5 space-y-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative group rounded-xl border transition-all duration-200 p-6 text-center cursor-pointer min-h-[220px] flex flex-col items-center justify-center bg-card/60 backdrop-blur-xs",
                            isDragActive 
                                ? "border-foreground bg-accent/40 ring-2 ring-foreground/10" 
                                : "border-border/80 hover:border-foreground/40 hover:bg-card/90"
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3 border border-border/70 group-hover:scale-105 transition-transform pointer-events-none">
                            <Upload className="h-5 w-5 text-foreground" />
                        </div>
                        <p className="font-semibold text-xs text-foreground pointer-events-none">
                            Add PDF Documents
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 pointer-events-none">
                            Drop files here or click to browse
                        </p>
                    </div>

                    <Button
                        onClick={handleMerge}
                        disabled={files.length < 2 || isMerging}
                        className="w-full text-xs h-10 gap-2 font-medium"
                    >
                        {isMerging ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing Merge...
                            </>
                        ) : (
                            <>
                                <Combine className="h-4 w-4" />
                                Merge {files.length > 0 ? `(${files.length}) Files` : "Files"}
                            </>
                        )}
                    </Button>

                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>All pages stitched locally in memory. Zero cloud transfer.</span>
                    </div>
                </div>

                {/* Queue / Reorder Shelf (7 cols) */}
                <div className="md:col-span-7">
                    <Card className="border border-border/70 bg-card shadow-xs h-full">
                        <CardContent className="p-4 flex flex-col h-full min-h-[280px]">
                            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Assembly Sequence
                                </span>
                                {files.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[11px] text-muted-foreground hover:text-destructive px-2"
                                        onClick={() => setMerge({ files: [], mergedPdfUrl: null })}
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            {files.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs py-10 space-y-2">
                                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                                    <p>No documents queued yet.</p>
                                    <p className="text-[11px] text-muted-foreground/70">
                                        Upload at least 2 PDF files to assemble.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto subtle-scrollbar space-y-2 max-h-[360px] pr-1">
                                    {files.map((file, index) => (
                                        <div 
                                            key={`${file.name}-${index}`} 
                                            className="flex items-center justify-between p-2.5 bg-secondary/40 hover:bg-secondary/70 border border-border/50 rounded-lg transition-colors group"
                                        >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <span className="text-[10px] font-mono font-bold w-5 h-5 rounded bg-background flex items-center justify-center shrink-0 border border-border/60 text-muted-foreground">
                                                    {index + 1}
                                                </span>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-medium text-foreground truncate max-w-[190px] sm:max-w-[260px]">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                                                    onClick={() => moveFile(index, "up")} 
                                                    disabled={index === 0}
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                                                    onClick={() => moveFile(index, "down")} 
                                                    disabled={index === files.length - 1}
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive" 
                                                    onClick={() => removeFile(index)}
                                                    title="Remove File"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Success Download Bar */}
            {mergedPdfUrl && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-foreground">Merge Complete</h3>
                            <p className="text-[11px] text-muted-foreground">
                                {files.length} documents compiled into a unified PDF.
                            </p>
                        </div>
                    </div>
                    <a href={mergedPdfUrl} download="merged-document.pdf" className="self-end sm:self-auto">
                        <Button size="sm" className="gap-2 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Download className="h-3.5 w-3.5" />
                            Download Merged PDF
                        </Button>
                    </a>
                </div>
            )}
        </div>
    );
}
