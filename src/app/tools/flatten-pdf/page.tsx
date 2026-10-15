"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { flattenPdf } from "@/lib/pdf-page-utils";
import { 
    Lock, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    ShieldCheck, 
    FileText, 
    Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FlattenPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isFlattening, setIsFlattening] = useState(false);
    const [flattenedPdfUrl, setFlattenedPdfUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setFlattenedPdfUrl(null);
    };

    const handleFlatten = async () => {
        if (!file) return;
        setIsFlattening(true);

        try {
            const buffer = await file.arrayBuffer();
            const outputBytes = await flattenPdf(new Uint8Array(buffer));
            const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
            setFlattenedPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("Failed to flatten PDF", err);
            alert("Error flattening PDF. Please try again.");
        } finally {
            setIsFlattening(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-medium mb-1">
                    <Lock className="h-3.5 w-3.5" />
                    Tamper-Proof Security
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Flatten PDF</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Permanently lock interactive form fields, checkboxes, stamps, and signatures into the background layer so they can never be modified.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop fillable PDF here to flatten"
                        subtitle="Upload forms, invoices, contracts, or signed agreements"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-card border border-border/80 rounded-xl p-6 space-y-6 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">{file.name}</h3>
                                    <p className="text-xs text-muted-foreground">Ready to flatten and lock into read-only</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setFlattenedPdfUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                        </div>

                        {/* Security Benefits */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/30 space-y-1">
                                <span className="font-semibold text-xs text-foreground block">Locks Form Inputs</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Converts interactive textboxes, drop-downs, and radio buttons into permanent text.
                                </p>
                            </div>
                            <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/30 space-y-1">
                                <span className="font-semibold text-xs text-foreground block">Burns Signatures</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Fuses digital signatures and initials directly into the page stream to avoid forgery.
                                </p>
                            </div>
                            <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/30 space-y-1">
                                <span className="font-semibold text-xs text-foreground block">100% Private</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Runs completely on your device so your sensitive files never leave your computer.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleFlatten}
                            disabled={isFlattening}
                            className="w-full h-11 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isFlattening ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Flattening & Locking PDF...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Flatten & Lock PDF Document
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Download Banner */}
                    {flattenedPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Flattened PDF Ready!</p>
                                    <p className="text-xs text-muted-foreground">
                                        All interactive forms and annotations have been locked into permanent background content.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={flattenedPdfUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_flattened.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Locked PDF
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
