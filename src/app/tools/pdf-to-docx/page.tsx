"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { convertPdfToDocx } from "@/lib/converters/pdf-to-docx";
import { FileText, Download, CheckCircle2, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function PdfToDocxPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [docxBlob, setDocxBlob] = useState<Blob | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setDocxBlob(null);
        setProgress(0);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);
        setProgress(10);

        try {
            const blob = await convertPdfToDocx(file, (current, total) => {
                setProgress(Math.round((current / total) * 100));
            });
            setDocxBlob(blob);
        } catch (error) {
            console.error("PDF to DOCX failed:", error);
            alert("Failed to convert PDF to Word document.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (!docxBlob) return;
        const url = URL.createObjectURL(docxBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file?.name.replace(/\.pdf$/i, '') || 'converted'}.docx`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-3xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <FileText className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Convert PDF to Word (.docx)
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Convert read-only PDF contracts, reports, and papers into fully editable Microsoft Word documents.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop your PDF here to convert to Word"
                    subtitle="Retains headings, bold formatting, and paragraph hierarchy"
                />
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • Target: Microsoft Word (.docx)
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                                setFile(null);
                                setDocxBlob(null);
                            }}
                        >
                            Choose Another File
                        </Button>
                    </div>

                    {!docxBlob ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/60 text-xs text-muted-foreground space-y-1">
                                <p className="font-semibold text-foreground">What happens during conversion:</p>
                                <p>• Text positions and line heights are analyzed to reconstruct native paragraphs.</p>
                                <p>• Large bold titles are converted to native Heading 1 &amp; Heading 2 styles.</p>
                                <p>• Clean `.docx` format compatible with Microsoft Word, Google Docs, and LibreOffice.</p>
                            </div>

                            <Button
                                onClick={handleConvert}
                                disabled={isConverting}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isConverting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Extracting Layout &amp; Generating Word Doc ({progress}%)...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Convert to Editable Word (.docx)</span>
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
                                    Conversion Complete!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Your Word document is ready to download and edit.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <Button
                                    onClick={handleDownload}
                                    className="h-9 px-5 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download .docx File</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
