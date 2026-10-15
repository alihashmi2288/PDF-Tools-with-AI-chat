"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertJsonToPdf, parseXmlToJson } from "@/lib/converters/json-to-pdf";
import { 
    FileSpreadsheet, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Sparkles, 
    Palette 
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_JSON = `[
  { "id": "USR-101", "name": "Sarah Connor", "role": "Lead Architect", "department": "Engineering", "status": "Active" },
  { "id": "USR-102", "name": "Marcus Wright", "role": "Security Analyst", "department": "Infosec", "status": "Active" },
  { "id": "USR-103", "name": "Elena Rostova", "role": "Product Manager", "department": "Product", "status": "On Leave" },
  { "id": "USR-104", "name": "David Chen", "role": "Data Scientist", "department": "AI Research", "status": "Active" },
  { "id": "USR-105", "name": "Chloe Bennett", "role": "UI/UX Designer", "department": "Design", "status": "Active" }
]`;

export default function JsonToPdfPage() {
    const [rawInput, setRawInput] = useState(SAMPLE_JSON);
    const [reportTitle, setReportTitle] = useState("Personnel Audit Report");
    const [organization, setOrganization] = useState("Acme Global Technologies");
    const [theme, setTheme] = useState<'indigo' | 'emerald' | 'slate' | 'classic'>('indigo');
    const [isGenerating, setIsGenerating] = useState(false);
    const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

    const handleFileUpload = async (file: File) => {
        const text = await file.text();
        setRawInput(text);
        setReportTitle(file.name.replace(/\.[^/.]+$/, '') + ' Report');
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            let data: any;
            const trimmed = rawInput.trim();

            if (trimmed.startsWith('<')) {
                // XML format
                data = parseXmlToJson(trimmed);
            } else {
                // JSON format
                data = JSON.parse(trimmed);
            }

            const pdfBytes = await convertJsonToPdf(data, {
                title: reportTitle,
                organization,
                theme,
            });

            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setOutputPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("JSON/XML report generation failed", err);
            alert("Error parsing JSON or XML. Please check syntax.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-medium mb-1">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Structured Data Engine
                </div>
                <h1 className="text-3xl font-bold tracking-tight">JSON / XML to PDF Report</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Transform JSON arrays, API responses, or XML feeds into publication-grade printable tabular PDF reports.
                </p>
            </div>

            <div className="space-y-6">
                {/* Configuration Bar */}
                <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-xs mb-1 block">Report Title</Label>
                            <Input
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-xs mb-1 block">Organization / Company</Label>
                            <Input
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-xs mb-1 block">Visual Theme</Label>
                            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                                {[
                                    { id: 'indigo', name: 'Indigo', color: 'bg-indigo-600' },
                                    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600' },
                                    { id: 'slate', name: 'Slate', color: 'bg-slate-700' },
                                    { id: 'classic', name: 'Blue', color: 'bg-blue-600' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id as any)}
                                        className={cn(
                                            "h-8 rounded flex items-center justify-center text-[10px] font-semibold text-white transition-all",
                                            t.color,
                                            theme === t.id ? "ring-2 ring-foreground/20 ring-offset-2 scale-105" : "opacity-75 hover:opacity-100"
                                        )}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor & Upload */}
                <div className="bg-card border border-border/80 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wider">Raw JSON or XML Data</span>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer text-primary hover:underline font-medium">
                                Upload File (.json / .xml)
                                <input
                                    type="file"
                                    accept=".json,.xml"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileUpload(e.target.files[0]);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <textarea
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                        rows={14}
                        className="w-full bg-secondary/30 rounded-lg p-3 font-mono text-xs leading-relaxed text-foreground resize-y border border-border/50 focus:outline-none"
                    />

                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full h-11 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Formatting Report Tables...
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Generate PDF Report
                            </>
                        )}
                    </Button>
                </div>

                {/* Download Banner */}
                {outputPdfUrl && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            <div>
                                <p className="text-sm font-semibold text-foreground">Styled PDF Report Ready!</p>
                                <p className="text-xs text-muted-foreground">
                                    Structured data automatically mapped into formatted tables with running page numbers.
                                </p>
                            </div>
                        </div>
                        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <a href={outputPdfUrl} download={`${reportTitle.replace(/\s+/g, '_')}.pdf`}>
                                <Download className="h-4 w-4 mr-1.5" />
                                Download Report PDF
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
