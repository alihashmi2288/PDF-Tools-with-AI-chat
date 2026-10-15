"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { convertPdfToXlsx } from "@/lib/converters/pdf-to-xlsx";
import { FileSpreadsheet, Download, CheckCircle2, Loader2, Sparkles, Table } from "lucide-react";

export default function PdfToXlsxPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [xlsxBlob, setXlsxBlob] = useState<Blob | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setXlsxBlob(null);
        setProgress(0);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);
        setProgress(15);

        try {
            const blob = await convertPdfToXlsx(file, (current, total) => {
                setProgress(Math.round((current / total) * 100));
            });
            setXlsxBlob(blob);
        } catch (error) {
            console.error("PDF to Excel failed:", error);
            alert("Failed to convert PDF to Excel spreadsheet.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (!xlsxBlob) return;
        const url = URL.createObjectURL(xlsxBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file?.name.replace(/\.pdf$/i, '') || 'converted'}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-3xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Convert PDF to Excel (.xlsx)
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Extract tables, columns, rows, and financial figures from invoices, bank statements, or reports into clean Excel spreadsheets.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop your PDF here to convert to Excel"
                    subtitle="Detects column alignments, numbers, and separate sheets per page"
                />
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <FileSpreadsheet className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • Target: Microsoft Excel (.xlsx)
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                                setFile(null);
                                setXlsxBlob(null);
                            }}
                        >
                            Change Document
                        </Button>
                    </div>

                    {!xlsxBlob ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/60 text-xs text-muted-foreground space-y-1">
                                <p className="font-semibold text-foreground flex items-center gap-1.5">
                                    <Table className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Intelligent Table Clustering:</span>
                                </p>
                                <p>• Scans horizontal &amp; vertical token coordinates to map data cells accurately.</p>
                                <p>• Automatically parses currency numbers into real numeric cells for instant SUM calculations.</p>
                                <p>• Compatible with Excel, Google Sheets, Apple Numbers, and Calc.</p>
                            </div>

                            <Button
                                onClick={handleConvert}
                                disabled={isConverting}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isConverting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Analyzing Tables &amp; Generating Excel ({progress}%)...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Convert to Excel (.xlsx)</span>
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
                                    Spreadsheet Ready!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Your tables have been exported to `.xlsx` format.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <Button
                                    onClick={handleDownload}
                                    className="h-9 px-5 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download .xlsx Spreadsheet</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
