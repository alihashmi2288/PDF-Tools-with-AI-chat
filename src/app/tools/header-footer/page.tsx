"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addHeaderAndFooter } from "@/lib/pdf-page-utils";
import { 
    Tag, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Sparkles, 
    Sliders, 
    Calendar, 
    Hash, 
    FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeaderFooterPage() {
    const [file, setFile] = useState<File | null>(null);
    const [headerLeft, setHeaderLeft] = useState("");
    const [headerCenter, setHeaderCenter] = useState("Strictly Confidential");
    const [headerRight, setHeaderRight] = useState("");
    const [footerLeft, setFooterLeft] = useState("{filename}");
    const [footerCenter, setFooterCenter] = useState("");
    const [footerRight, setFooterRight] = useState("Page {page} of {total}");
    const [fontSize, setFontSize] = useState(9);
    const [colorHex, setColorHex] = useState("#666666");
    const [skipFirstPage, setSkipFirstPage] = useState(true);
    const [isStamping, setIsStamping] = useState(false);
    const [stampedPdfUrl, setStampedPdfUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setStampedPdfUrl(null);
    };

    const handleStamp = async () => {
        if (!file) return;
        setIsStamping(true);

        try {
            const buffer = await file.arrayBuffer();
            const outputBytes = await addHeaderAndFooter(new Uint8Array(buffer), {
                headerLeft,
                headerCenter,
                headerRight,
                footerLeft,
                footerCenter,
                footerRight,
                fontSize,
                colorHex,
                skipFirstPage,
                filename: file.name.replace(/\.[^/.]+$/, ''),
            });

            const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
            setStampedPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("Failed to add headers and footers", err);
            alert("Error adding headers/footers. Please try again.");
        } finally {
            setIsStamping(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium mb-1">
                    <Tag className="h-3.5 w-3.5" />
                    Page Utility
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Header & Footer Generator</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Stamp running headers, footers, confidentiality notices, and dynamic page numbering across all pages.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop PDF here to add headers and footers"
                        subtitle="Upload any document to stamp custom text and dynamic counters"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-card border border-border/80 rounded-xl p-6 space-y-6 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Header & Footer Configuration</h3>
                                <p className="text-xs text-muted-foreground">Customize text positions. You can use dynamic variables: &#123;page&#125;, &#123;total&#125;, &#123;date&#125;, &#123;filename&#125;</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setStampedPdfUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                        </div>

                        {/* Running Headers */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Running Headers (Top)</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[11px] text-muted-foreground mb-1 block">Header Left</span>
                                    <Input
                                        value={headerLeft}
                                        onChange={(e) => setHeaderLeft(e.target.value)}
                                        placeholder="e.g. Project Apollo"
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground mb-1 block">Header Center</span>
                                    <Input
                                        value={headerCenter}
                                        onChange={(e) => setHeaderCenter(e.target.value)}
                                        placeholder="e.g. Confidential"
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground mb-1 block">Header Right</span>
                                    <Input
                                        value={headerRight}
                                        onChange={(e) => setHeaderRight(e.target.value)}
                                        placeholder="e.g. {date}"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Running Footers */}
                        <div className="space-y-3 pt-2 border-t border-border/50">
                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Running Footers (Bottom)</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[11px] text-muted-foreground mb-1 block">Footer Left</span>
                                    <Input
                                        value={footerLeft}
                                        onChange={(e) => setFooterLeft(e.target.value)}
                                        placeholder="e.g. {filename}"
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground mb-1 block">Footer Center</span>
                                    <Input
                                        value={footerCenter}
                                        onChange={(e) => setFooterCenter(e.target.value)}
                                        placeholder="e.g. Draft v1.0"
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground mb-1 block">Footer Right</span>
                                    <Input
                                        value={footerRight}
                                        onChange={(e) => setFooterRight(e.target.value)}
                                        placeholder="e.g. Page {page} of {total}"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Options: Font size, Color, Skip Cover */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={skipFirstPage}
                                        onChange={(e) => setSkipFirstPage(e.target.checked)}
                                        className="rounded border-border"
                                    />
                                    Skip Cover Page (Page 1)
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Size:</span>
                                    <Input
                                        type="number"
                                        min="7"
                                        max="14"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="h-8 w-16 text-xs"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Color:</span>
                                    <input
                                        type="color"
                                        value={colorHex}
                                        onChange={(e) => setColorHex(e.target.value)}
                                        className="h-8 w-8 rounded cursor-pointer border border-border"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleStamp}
                                disabled={isStamping}
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5"
                            >
                                {isStamping ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                        Stamping...
                                    </>
                                ) : (
                                    <>
                                        <Tag className="h-4 w-4 mr-1.5" />
                                        Apply Header & Footer
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Download Banner */}
                    {stampedPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Headers & Footers Applied!</p>
                                    <p className="text-xs text-muted-foreground">
                                        Custom headers and running footers stamped across all pages.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={stampedPdfUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_stamped.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Stamped PDF
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
