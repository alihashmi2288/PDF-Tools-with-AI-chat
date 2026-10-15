"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { convertPdfToPptx } from "@/lib/converters/pdf-to-pptx";
import { Presentation, Download, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function PdfToPptxPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pptxBlob, setPptxBlob] = useState<Blob | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setPptxBlob(null);
        setProgress(0);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);
        setProgress(15);

        try {
            const blob = await convertPdfToPptx(file, (current, total) => {
                setProgress(Math.round((current / total) * 100));
            });
            setPptxBlob(blob);
        } catch (error) {
            console.error("PDF to PowerPoint failed:", error);
            alert("Failed to convert PDF to PowerPoint slides.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (!pptxBlob) return;
        const url = URL.createObjectURL(pptxBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file?.name.replace(/\.pdf$/i, '') || 'presentation'}.pptx`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-3xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                        <Presentation className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Convert PDF to PowerPoint (.pptx)
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Convert PDF slide decks, lecture slides, and marketing pitches into presentation-ready PowerPoint slides.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop your PDF slide deck here"
                    subtitle="Creates widescreen 16:9 presentation slides with embedded transcripts"
                />
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                                <Presentation className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • Target: PowerPoint Presentation (.pptx)
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                                setFile(null);
                                setPptxBlob(null);
                            }}
                        >
                            Change Document
                        </Button>
                    </div>

                    {!pptxBlob ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/60 text-xs text-muted-foreground space-y-1">
                                <p className="font-semibold text-foreground">PowerPoint Optimization Details:</p>
                                <p>• Renders each page into high-definition vector-scaled presentation visuals.</p>
                                <p>• Injects extracted text into Slide Speaker Notes for reference and searchability.</p>
                                <p>• 100% compatible with PowerPoint, Google Slides, Keynote, and Canva.</p>
                            </div>

                            <Button
                                onClick={handleConvert}
                                disabled={isConverting}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {isConverting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Rendering Slides ({progress}%)...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Convert to PowerPoint (.pptx)</span>
                                    </>
                                )}
                            </Button>

                            {isConverting && (
                                <div className="space-y-1.5 pt-2">
                                    <Progress value={progress} className="h-1.5" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 text-center">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-sm text-foreground">
                                    Presentation Ready!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Your slide deck has been compiled into `.pptx` format.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <Button
                                    onClick={handleDownload}
                                    className="h-9 px-5 text-xs font-semibold gap-2 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download .pptx Presentation</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
