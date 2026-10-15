"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertHtmlToPdf } from "@/lib/converters/html-to-pdf";
import { 
    Code, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Globe, 
    FileCode, 
    Sparkles, 
    Eye 
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_HTML = `<div style="padding: 20px; font-family: sans-serif; color: #1e293b;">
  <h1 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Invoice #INV-2026-001</h1>
  <p><strong>Billed To:</strong> Acme Corporation</p>
  <p><strong>Date:</strong> October 15, 2026</p>
  
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <thead>
      <tr style="background-color: #f1f5f9; text-align: left;">
        <th style="padding: 8px; border: 1px solid #cbd5e1;">Item</th>
        <th style="padding: 8px; border: 1px solid #cbd5e1;">Hours</th>
        <th style="padding: 8px; border: 1px solid #cbd5e1;">Rate</th>
        <th style="padding: 8px; border: 1px solid #cbd5e1;">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">Cloud Architecture Design</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">40</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">$150/hr</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">$6,000</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">Frontend Development</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">60</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">$120/hr</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">$7,200</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 24px; text-align: right;">
    <h3 style="color: #0f172a;">Grand Total: $13,200.00</h3>
  </div>
</div>`;

export default function HtmlToPdfPage() {
    const [activeTab, setActiveTab] = useState<'upload' | 'code' | 'url'>('code');
    const [htmlCode, setHtmlCode] = useState(SAMPLE_HTML);
    const [urlInput, setUrlInput] = useState("");
    const [fileName, setFileName] = useState("document.pdf");
    const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'legal'>('a4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [marginMm, setMarginMm] = useState(10);
    const [isConverting, setIsConverting] = useState(false);
    const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

    const handleFileUpload = async (file: File) => {
        setFileName(file.name.replace(/\.[^/.]+$/, '') + '.pdf');
        const text = await file.text();
        setHtmlCode(text);
        setActiveTab('code');
    };

    const handleConvert = async () => {
        setIsConverting(true);
        try {
            const outputBytes = await convertHtmlToPdf(htmlCode, {
                pageSize,
                orientation,
                marginMm,
            });

            const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
            setOutputPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("HTML to PDF conversion failed", err);
            alert("Error converting HTML to PDF. Please check your markup.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-medium mb-1">
                    <FileCode className="h-3.5 w-3.5" />
                    Web & Markup Converter
                </div>
                <h1 className="text-3xl font-bold tracking-tight">HTML / Webpage to PDF</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Convert raw HTML/CSS markup, uploaded .html files, or web snippets into crisp, printable PDF documents.
                </p>
            </div>

            {/* Tab Selector */}
            <div className="flex justify-center">
                <div className="inline-flex p-1 rounded-xl bg-secondary border border-border/60">
                    <button
                        onClick={() => setActiveTab('code')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            activeTab === 'code' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Paste HTML Code
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            activeTab === 'upload' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Upload .html File
                    </button>
                </div>
            </div>

            {activeTab === 'upload' ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileUpload}
                        accept={{ 'text/html': ['.html', '.htm'] }}
                        title="Drop your HTML file here"
                        subtitle="Upload any .html or .htm file to convert"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Settings Bar */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Format:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(e.target.value as any)}
                                    className="h-8 text-xs bg-secondary rounded border border-border px-2"
                                >
                                    <option value="a4">A4 (210 x 297 mm)</option>
                                    <option value="letter">US Letter (8.5 x 11 in)</option>
                                    <option value="legal">US Legal (8.5 x 14 in)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Orientation:</span>
                                <select
                                    value={orientation}
                                    onChange={(e) => setOrientation(e.target.value as any)}
                                    className="h-8 text-xs bg-secondary rounded border border-border px-2"
                                >
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Margins:</span>
                                <select
                                    value={marginMm}
                                    onChange={(e) => setMarginMm(Number(e.target.value))}
                                    className="h-8 text-xs bg-secondary rounded border border-border px-2"
                                >
                                    <option value={10}>Normal (10mm)</option>
                                    <option value={5}>Compact (5mm)</option>
                                    <option value={0}>None (0mm)</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            onClick={handleConvert}
                            disabled={isConverting}
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Convert to PDF
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Download Banner */}
                    {outputPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Print-Ready PDF Generated!</p>
                                    <p className="text-xs text-muted-foreground">
                                        Rendered faithfully with high-DPI canvas vector scaling.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={outputPdfUrl} download={fileName}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download PDF
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Code & Preview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Editor */}
                        <div className="bg-card border border-border/80 rounded-xl p-4 space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                HTML / CSS Source
                            </Label>
                            <textarea
                                value={htmlCode}
                                onChange={(e) => setHtmlCode(e.target.value)}
                                rows={16}
                                className="w-full bg-secondary/30 rounded-lg p-3 font-mono text-xs leading-relaxed text-foreground resize-y border border-border/50 focus:outline-none"
                            />
                        </div>

                        {/* Live Sandbox Preview */}
                        <div className="bg-card border border-border/80 rounded-xl p-4 space-y-2 flex flex-col">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Live Visual Preview
                                </Label>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    Sandbox
                                </span>
                            </div>
                            <div className="flex-1 min-h-[300px] bg-white rounded-lg border border-border/50 overflow-hidden">
                                <iframe
                                    srcDoc={htmlCode}
                                    title="HTML Preview"
                                    className="w-full h-full min-h-[320px] border-0"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
