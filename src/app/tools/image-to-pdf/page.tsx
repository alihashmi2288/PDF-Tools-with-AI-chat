"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Image as ImageIcon, Upload, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { convertImagesToPdf } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { useGlobalToolContext } from "@/context/GlobalToolContext";
import { ImageGrid } from "@/components/tools/ImageGrid";

export default function ImageToPdfPage() {
    const { imageToPdf, setImageToPdf } = useGlobalToolContext();
    const { files, isConverting, pdfUrl } = imageToPdf;

    const onDrop = (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.filter(f => f.type.startsWith("image/"));
        setImageToPdf({
            files: [...files, ...newFiles],
            pdfUrl: null
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"]
        },
    });

    const setFiles = (newFiles: File[]) => {
        setImageToPdf({
            files: newFiles,
            pdfUrl: null
        });
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setImageToPdf({ isConverting: true });

        try {
            const pdfBytes = await convertImagesToPdf(files);
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setImageToPdf({ pdfUrl: url });
        } catch (error) {
            console.error("Conversion failed:", error);
            alert("Failed to convert images. Please try again.");
        } finally {
            setImageToPdf({ isConverting: false });
        }
    };

    return (
        <div className="max-w-5xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                            <ImageIcon className="h-4 w-4 text-purple-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Images to PDF Compilation
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Compile JPG, PNG, and WebP images into a single formatted PDF document. Drag to reorder.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-secondary border border-border/50">
                        {files.length} {files.length === 1 ? "image" : "images"} selected
                    </span>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Intake & Action (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative group rounded-xl border transition-all duration-200 p-6 text-center cursor-pointer min-h-[190px] flex flex-col items-center justify-center bg-card/60 backdrop-blur-xs",
                            isDragActive 
                                ? "border-foreground bg-accent/40 ring-2 ring-foreground/10" 
                                : "border-border/80 hover:border-foreground/40 hover:bg-card/90"
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3 border border-border/70 group-hover:scale-105 transition-transform pointer-events-none">
                            <Upload className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="font-semibold text-xs text-foreground pointer-events-none">
                            Add Images
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 pointer-events-none">
                            JPG, PNG, WebP
                        </p>
                    </div>

                    <Button
                        onClick={handleConvert}
                        disabled={files.length === 0 || isConverting}
                        className="w-full text-xs h-10 gap-2 font-medium"
                    >
                        {isConverting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Compiling Images to PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Compile to PDF ({files.length})
                            </>
                        )}
                    </Button>

                    {pdfUrl && (
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <h3 className="font-bold text-xs text-foreground">Compilation Complete</h3>
                            </div>
                            <a href={pdfUrl} download="images-compilation.pdf" className="block w-full">
                                <Button className="w-full gap-2 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Download className="h-3.5 w-3.5" />
                                    Download PDF Document
                                </Button>
                            </a>
                        </div>
                    )}

                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>High-res embedding in local canvas. Zero compression loss.</span>
                    </div>
                </div>

                {/* Right Column: Visual Grid (8 cols) */}
                <div className="lg:col-span-8">
                    <Card className="border border-border/70 bg-card shadow-xs h-full min-h-[420px] flex flex-col">
                        <CardContent className="p-0 h-full flex flex-col flex-1">
                            <div className="p-3.5 border-b border-border/60 flex items-center justify-between bg-secondary/20">
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Image Order & Preview
                                </span>
                                {files.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[11px] text-muted-foreground hover:text-destructive px-2"
                                        onClick={() => setFiles([])}
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            {files.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 space-y-2">
                                    <ImageIcon className="h-10 w-10 opacity-30" />
                                    <p className="text-xs">No images loaded in sequence.</p>
                                    <p className="text-[11px] text-muted-foreground/70">
                                        Drop images to visually reorder before compiling.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 p-3 bg-secondary/10 overflow-y-auto subtle-scrollbar">
                                    <ImageGrid files={files} setFiles={setFiles} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
