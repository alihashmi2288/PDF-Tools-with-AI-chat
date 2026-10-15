"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { convertPdfToTxt, ExtractedTextResult } from "@/lib/converters/pdf-to-txt";
import { 
    FileText, 
    Download, 
    Copy, 
    Check, 
    Search, 
    Loader2, 
    RefreshCw, 
    Sparkles, 
    Clock, 
    Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PdfToTxtPage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ExtractedTextResult | null>(null);
    const [includeDividers, setIncludeDividers] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsExtracting(true);
        setCopied(false);

        try {
            const data = await convertPdfToTxt(selectedFile, {
                includePageDividers: includeDividers,
                preserveLineBreaks: true,
            });
            setResult(data);
        } catch (err) {
            console.error("Text extraction failed", err);
            alert("Failed to extract text from PDF.");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!file || !result) return;
        const blob = new Blob([result.fullText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace(/\.[^/.]+$/, '')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredText = result?.fullText
        ? searchQuery
            ? result.fullText.split('\n').filter(line => line.toLowerCase().includes(searchQuery.toLowerCase())).join('\n')
            : result.fullText
        : "";

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium mb-1">
                    <FileText className="h-3.5 w-3.5" />
                    Plain Text Converter
                </div>
                <h1 className="text-3xl font-bold tracking-tight">PDF to TXT (Plain Text)</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Extract clean, raw text from any PDF document with zero formatting artifacts. Ideal for LLMs, code, and spreadsheets.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop PDF here to extract plain text"
                        subtitle="Upload any PDF to extract all page text immediately"
                    />
                </div>
            ) : isExtracting ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">Extracting text from all pages...</p>
                    <p className="text-xs text-muted-foreground">Cleaning up lines and calculating word statistics</p>
                </div>
            ) : result && (
                <div className="space-y-6">
                    {/* Stats & Control Bar */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setFile(null); setResult(null); }}
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                    Choose New File
                                </Button>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span><strong>{result.wordCount.toLocaleString()}</strong> words</span>
                                    <span>•</span>
                                    <span><strong>{result.characterCount.toLocaleString()}</strong> chars</span>
                                    <span>•</span>
                                    <span><strong>{result.pageCount}</strong> pages</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        ~{result.readingTimeMinutes} min read
                                    </span>
                                </div>
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
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                                            Copy Text
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    size="sm"
                                    className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                >
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Download .txt
                                </Button>
                            </div>
                        </div>

                        {/* Search Filter */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search within extracted text..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Text Preview Box */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-inner">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 text-xs text-muted-foreground">
                            <span>Extracted Raw Text Output</span>
                            {searchQuery && (
                                <span className="text-primary font-medium">Filtering by &quot;{searchQuery}&quot;</span>
                            )}
                        </div>
                        <textarea
                            readOnly
                            value={filteredText}
                            rows={18}
                            className="w-full bg-secondary/30 rounded-lg p-4 font-mono text-xs leading-relaxed text-foreground resize-y border border-border/50 focus:outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
