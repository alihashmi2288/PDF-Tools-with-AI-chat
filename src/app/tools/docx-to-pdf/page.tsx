"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Loader2, Upload, ShieldCheck, CheckCircle2 } from "lucide-react";
import mammoth from "mammoth";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

export default function DocxToPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setIsSuccess(false);
        }
    };

    const convertToPdf = async () => {
        if (!file) return;
        setConverting(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            tempDiv.style.width = "210mm";
            tempDiv.style.padding = "20mm";
            tempDiv.style.fontFamily = "Arial, sans-serif";
            tempDiv.style.fontSize = "12pt";
            tempDiv.style.lineHeight = "1.5";
            document.body.appendChild(tempDiv);

            const pdf = new jsPDF("p", "mm", "a4");
            await pdf.html(tempDiv, {
                callback: (doc) => {
                    doc.save(file.name.replace(/\.(docx|doc)$/i, ".pdf"));
                    document.body.removeChild(tempDiv);
                    setConverting(false);
                    setIsSuccess(true);
                },
                x: 10,
                y: 10,
                width: 190,
                windowWidth: 794
            });
        } catch (error) {
            console.error("Conversion error:", error);
            alert("Failed to convert DOCX to PDF");
            setConverting(false);
        }
    };

    return (
        <div className="max-w-3xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                            <FileText className="h-4 w-4 text-foreground" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Word (.docx) to PDF
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Convert Word documents to styled PDF while maintaining paragraph hierarchy.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {!file ? (
                    <label 
                        htmlFor="docx-upload" 
                        className="relative group rounded-xl border border-border/80 hover:border-foreground/40 bg-card/60 hover:bg-card/90 transition-all p-8 flex flex-col items-center justify-center cursor-pointer min-h-[220px] text-center"
                    >
                        <input
                            type="file"
                            accept=".docx,.doc"
                            onChange={handleFileChange}
                            className="hidden"
                            id="docx-upload"
                        />
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3 border border-border/70 group-hover:scale-105 transition-transform pointer-events-none">
                            <Upload className="h-5 w-5 text-foreground" />
                        </div>
                        <p className="font-semibold text-xs text-foreground pointer-events-none">
                            Select Word Document
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 pointer-events-none">
                            Supports .docx and .doc files
                        </p>
                    </label>
                ) : (
                    <div className="space-y-5">
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
                                        {(file.size / 1024).toFixed(1)} KB • Word Document
                                    </p>
                                </div>
                            </div>

                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => { setFile(null); setIsSuccess(false); }}
                            >
                                Change
                            </Button>
                        </div>

                        <Button 
                            onClick={convertToPdf} 
                            disabled={converting}
                            className="w-full text-xs h-10 gap-2 font-medium"
                        >
                            {converting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Rendering Document to PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Convert to PDF & Download
                                </>
                            )}
                        </Button>

                        {isSuccess && (
                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                <div className="text-xs">
                                    <p className="font-bold text-foreground">Conversion Complete</p>
                                    <p className="text-muted-foreground text-[11px]">PDF file has been generated and downloaded.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-3 rounded-lg bg-secondary/40 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Processed in-memory with Mammoth.js. Zero document exposure.</span>
                </div>
            </div>
        </div>
    );
}
