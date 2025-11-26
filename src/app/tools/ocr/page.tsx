"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Copy, Check, ScanText, Loader2, Download, FileType } from "lucide-react";
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

        setOCR({ isProcessing: true, text: "", status: "Initializing..." });

        try {
            const worker = await createWorker('eng', 1, {
                logger: (m: any) => {
                    if (m.status === 'recognizing text') {
                        // Only show progress for single image or current page
                        // For PDF, we handle progress manually
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
                setOCR({ status: "Loading PDF..." });

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
                    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
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
                    status: "Completed!"
                });

            } else {
                const { data: { text } } = await worker.recognize(file);
                setOCR({
                    text: text,
                    progress: 100,
                    status: "Completed!"
                });
            }

            await worker.terminate();
        } catch (error) {
            console.error("OCR Failed:", error);
            setOCR({ status: "Error occurred during OCR processing." });
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
            const fontSize = 12;
            const margin = 50;

            page.drawText(text, {
                x: margin,
                y: height - margin,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                maxWidth: width - (margin * 2),
                lineHeight: fontSize * 1.2,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ocr-extracted-${file?.name || "text"}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to generate PDF.");
        }
    };

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">OCR (Image/PDF to Text)</h1>
                <p className="text-muted-foreground">
                    Extract text from images or PDFs using AI-powered Optical Character Recognition.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors h-64 flex flex-col items-center justify-center relative overflow-hidden",
                            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:bg-muted/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <>
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-contain opacity-50 p-4"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <FileType className="w-32 h-32" />
                                    </div>
                                )}
                                <div className="relative z-10 bg-background/80 p-4 rounded-lg backdrop-blur-sm">
                                    {file.type.startsWith('image/') ? (
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    ) : (
                                        <FileType className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    )}
                                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <ScanText className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="font-medium">Drop image or PDF here</p>
                                <p className="text-sm text-muted-foreground">Supports PNG, JPG, BMP, WEBP, PDF</p>
                            </>
                        )}
                    </div>

                    <Button
                        onClick={handleOCR}
                        disabled={!file || isProcessing}
                        className="w-full"
                        size="lg"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <ScanText className="mr-2 h-4 w-4" />
                                Extract Text
                            </>
                        )}
                    </Button>

                    {isProcessing && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-xs text-center text-muted-foreground capitalize">{status}</p>
                        </div>
                    )}
                </div>

                <Card className="h-full min-h-[400px]">
                    <CardContent className="p-0 h-full flex flex-col">
                        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                            <h3 className="font-semibold">Extracted Text</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={handleDownloadPDF} disabled={!text}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                                <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!text}>
                                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 p-4">
                            {text ? (
                                <textarea
                                    className="w-full h-full min-h-[300px] resize-none bg-transparent border-none focus:outline-none font-mono text-sm"
                                    value={text}
                                    readOnly
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                    No text extracted yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
