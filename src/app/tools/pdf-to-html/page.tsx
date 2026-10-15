"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { convertPdfToHtml } from "@/lib/converters/pdf-to-html";
import { 
    Code, 
    Download, 
    CheckCircle2, 
    Copy, 
    Check, 
    Loader2, 
    RefreshCw, 
    Globe, 
    Eye 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PdfToHtmlPage() {
    const [file, setFile] = useState<File | null>(null);
    const [htmlResult, setHtmlResult] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsConverting(true);
        setCopied(false);

        try {
            const html = await convertPdfToHtml(selectedFile);
            setHtmlResult(html);
        } catch (err) {
            console.error("PDF to HTML conversion failed", err);
            alert("Error converting PDF to HTML.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleCopy = () => {
        if (!htmlResult) return;
        navigator.clipboard.writeText(htmlResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!file || !htmlResult) return;
        const blob = new Blob([htmlResult], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace(/\.[^/.]+$/, '')}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-medium mb-1">
                    <Globe className="h-3.5 w-3.5" />
                    Web Converter
                </div>
                <h1 className="text-3xl font-bold tracking-tight">PDF to HTML Webpage</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Transform PDF documents into responsive, publishable HTML web documents with clean typography and layout.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop PDF to convert to responsive HTML"
                        subtitle="Generates clean, single-file HTML ready for website publishing"
                    />
                </div>
            ) : isConverting ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                    <p className="text-sm font-medium text-foreground">Converting document to HTML structure...</p>
                    <p className="text-xs text-muted-foreground">Parsing paragraphs, headings, and formatting styles</p>
                </div>
            ) : htmlResult && (
                <div className="space-y-6">
                    {/* Action Bar */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setHtmlResult(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Document: <strong>{file.name}</strong>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleCopy}
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                                        HTML Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                                        Copy Code
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleDownload}
                                size="sm"
                                className="h-9 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium"
                            >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Download .html
                            </Button>
                        </div>
                    </div>

                    {/* Live Preview Iframe */}
                    <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold uppercase tracking-wider">Live HTML Render Preview</span>
                            <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                Interactive Webpage View
                            </span>
                        </div>
                        <div className="w-full h-[550px] bg-slate-50 dark:bg-slate-950 rounded-lg border border-border/60 overflow-hidden">
                            <iframe
                                srcDoc={htmlResult}
                                title="Generated HTML"
                                className="w-full h-full border-0"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
