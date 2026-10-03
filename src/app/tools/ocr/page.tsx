"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Copy, Check, ScanText, Loader2, Download, FileType, ShieldCheck, Sparkles } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { createWorker } from "tesseract.js";
import { cn } from "@/lib/utils";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useGlobalToolContext } from "@/context/GlobalToolContext";

export default function OCRPage() {
    const { ocr, setOCR } = useGlobalToolContext();
    const { file, text, isProcessing, progress, status, copied } = ocr;

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setOCR({
                file: acceptedFiles[0],
                text: "",
                progress: 0,
                status: ""
            });
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp"],
            "application/pdf": [".pdf"],
        },
        multiple: false,
    });

    const handleOCR = async () => {
        if (!file) return;

        setOCR({ isProcessing: true, text: "", status: "Initializing OCR Engine..." });

        try {
            const worker = await createWorker('eng', 1, {
                logger: (m: any) => {
                    if (m.status === 'recognizing text') {
                        if (!file.type.includes('pdf')) {
                            setOCR({
                                progress: Math.round(m.progress * 100),
                                status: `Recognizing text... ${Math.round(m.progress * 100)}%`
                            });
                        }
                    } else {
                        setOCR({ status: m.status });
                    }
                }
            });

            if (file.type === 'application/pdf') {
                setOCR({ status: "Extracting PDF raster layers..." });

                const { pdfjs } = await import('react-pdf');
                pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument(arrayBuffer).promise;
                const numPages = pdf.numPages;
                let fullText = "";

                for (let i = 1; i <= numPages; i++) {
                    setOCR({
                        status: `Processing page ${i} of ${numPages}...`,
                        progress: Math.round(((i - 1) / numPages) * 100)
                    });

                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        await page.render({ canvasContext: context, viewport: viewport } as any).promise;
                        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

                        if (blob) {
                            const { data: { text: pageText } } = await worker.recognize(blob);
                            fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
                        }
                    }
                }
                setOCR({
                    text: fullText,
                    progress: 100,
                    status: "OCR Complete"
                });

            } else {
                const { data: { text } } = await worker.recognize(file);
                setOCR({
                    text: text,
                    progress: 100,
                    status: "OCR Complete"
                });
            }

            await worker.terminate();
        } catch (error) {
            console.error("OCR Failed:", error);
            setOCR({ status: "Failed to extract text from target." });
        } finally {
            setOCR({ isProcessing: false });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setOCR({ copied: true });
        setTimeout(() => setOCR({ copied: false }), 2000);
    };

    const handleDownloadPDF = async () => {
        if (!text) return;

        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 11;
            const margin = 40;

            page.drawText(text, {
                x: margin,
                y: height - margin,
                size: fontSize,
                font: font,
                color: rgb(0.1, 0.1, 0.1),
                maxWidth: width - (margin * 2),
                lineHeight: fontSize * 1.3,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ocr-${file?.name || "extracted"}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to export PDF.");
        }
    };

    return (
        <div className="max-w-4xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                            <ScanText className="h-4 w-4 text-foreground" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            OCR Optical Extraction
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Extract selectable text from flattened scans, images, or legacy PDFs in browser memory.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Upload & Control Panel (5 cols) */}
                <div className="md:col-span-5 space-y-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative group rounded-xl border transition-all duration-200 p-6 text-center cursor-pointer min-h-[220px] flex flex-col items-center justify-center overflow-hidden bg-card/60 backdrop-blur-xs",
                            isDragActive 
                                ? "border-foreground bg-accent/40 ring-2 ring-foreground/10" 
                                : "border-border/80 hover:border-foreground/40 hover:bg-card/90"
                        )}
                    >
                        <input {...getInputProps()} />

                        {file ? (
                            <div className="space-y-3 z-10">
                                <div className="h-10 w-10 mx-auto rounded-lg bg-secondary flex items-center justify-center border border-border/70">
                                    <FileText className="h-5 w-5 text-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                        {(file.size / 1024).toFixed(1)} KB • {file.type || "Scan"}
                                    </p>
                                </div>
                                <span className="text-[10px] text-muted-foreground underline decoration-border">
                                    Click or drop to replace
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-2 pointer-events-none">
                                <div className="h-10 w-10 mx-auto rounded-lg bg-secondary flex items-center justify-center border border-border/70 group-hover:scale-105 transition-transform">
                                    <ScanText className="h-5 w-5 text-foreground" />
                                </div>
                                <p className="font-semibold text-xs text-foreground">
                                    Select Image or Scan PDF
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    PNG, JPG, WEBP, or PDF
                                </p>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleOCR}
                        disabled={!file || isProcessing}
                        className="w-full text-xs h-10 gap-2 font-medium"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Running Neural OCR...
                            </>
                        ) : (
                            <>
                                <ScanText className="h-4 w-4" />
                                Extract Text Content
                            </>
                        )}
                    </Button>

                    {isProcessing && (
                        <div className="space-y-2 p-3.5 rounded-lg border border-border/60 bg-card">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-muted-foreground truncate">{status}</span>
                                <span className="text-foreground font-bold tabular-nums">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                        </div>
                    )}

                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Tesseract neural net runs 100% in your local WebWorker.</span>
                    </div>
                </div>

                {/* Output Console (7 cols) */}
                <div className="md:col-span-7">
                    <Card className="border border-border/70 bg-card shadow-xs h-full min-h-[360px] flex flex-col">
                        <div className="p-3 border-b border-border/60 flex items-center justify-between bg-secondary/20">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Extracted Output
                                </span>
                                {text && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground tabular-nums">
                                        {text.length} chars
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs gap-1.5" 
                                    onClick={copyToClipboard} 
                                    disabled={!text}
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </Button>
                                <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="h-7 text-xs gap-1.5" 
                                    onClick={handleDownloadPDF} 
                                    disabled={!text}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Export PDF</span>
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 p-4 bg-background/50">
                            {text ? (
                                <textarea
                                    className="w-full h-full min-h-[280px] resize-none bg-transparent border-none focus:outline-none font-mono text-xs text-foreground leading-relaxed subtle-scrollbar"
                                    value={text}
                                    readOnly
                                />
                            ) : (
                                <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-muted-foreground text-xs space-y-1">
                                    <ScanText className="h-8 w-8 text-muted-foreground/40 mb-1" />
                                    <p>Ready to extract</p>
                                    <p className="text-[11px] text-muted-foreground/70">
                                        Extracted text will appear here with markdown preservation.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
