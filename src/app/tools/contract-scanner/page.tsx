"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { 
    FileSearch, 
    ShieldAlert, 
    ShieldCheck, 
    AlertTriangle, 
    CheckCircle2, 
    Loader2, 
    Download, 
    Sparkles, 
    ArrowRight, 
    GitCompare, 
    Scale 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlaggedClause {
    title: string;
    severity: 'high' | 'medium' | 'low';
    originalSnippet: string;
    revisedSnippet: string;
    riskExplanation: string;
    counterRecommendation: string;
}

interface ContractScanResult {
    overallRiskScore: number;
    riskLevel: 'High' | 'Medium' | 'Low';
    executiveSummary: string;
    flaggedClauses: FlaggedClause[];
    favorableChanges?: string[];
    checklistForCounsel?: string[];
}

export default function ContractScannerPage() {
    const [mode, setMode] = useState<'audit' | 'compare'>('compare');
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [revisedFile, setRevisedFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ContractScanResult | null>(null);

    const handleScan = async () => {
        if (mode === 'compare' && (!originalFile || !revisedFile)) {
            alert("Please select both the Original and Revised contract files.");
            return;
        }
        if (mode === 'audit' && !originalFile) {
            alert("Please select a contract file to audit.");
            return;
        }

        setIsScanning(true);
        setScanResult(null);

        try {
            const originalText = originalFile ? await extractTextFromPDF(originalFile) : "";
            const revisedText = revisedFile ? await extractTextFromPDF(revisedFile) : "";

            const res = await fetch("/api/ai/contract-scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode,
                    originalText,
                    revisedText,
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to scan contract");
            }

            const data = await res.json();
            setScanResult(data);
        } catch (err: any) {
            console.error("Contract scan failed:", err);
            alert("Failed to analyze contract: " + (err?.message || "Unknown error"));
        } finally {
            setIsScanning(false);
        }
    };

    const downloadReportMarkdown = () => {
        if (!scanResult) return;
        let md = `# Contract Risk & Redline Audit Report\n\n`;
        md += `**Overall Risk Score:** ${scanResult.overallRiskScore}/100 (${scanResult.riskLevel} Risk)\n\n`;
        md += `## Executive Summary\n${scanResult.executiveSummary}\n\n`;
        md += `## Flagged Clauses\n`;

        scanResult.flaggedClauses.forEach((c, idx) => {
            md += `### ${idx + 1}. ${c.title} [${c.severity.toUpperCase()}]\n`;
            if (c.originalSnippet) md += `**Original Text:**\n> ${c.originalSnippet}\n\n`;
            if (c.revisedSnippet) md += `**Counterparty Revision:**\n> ${c.revisedSnippet}\n\n`;
            md += `**Risk Explanation:**\n${c.riskExplanation}\n\n`;
            md += `**Recommended Counter-Clause:**\n\`\`\`\n${c.counterRecommendation}\n\`\`\`\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contract_audit_report.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
                        <Scale className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        AI Contract Redliner &amp; Risk Scanner
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Compare two PDF contract versions side-by-side or scan a single agreement to detect added liabilities, altered numbers, and trap clauses.
                </p>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl border border-border/60 max-w-md">
                <button
                    type="button"
                    onClick={() => {
                        setMode('compare');
                        setScanResult(null);
                    }}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        mode === 'compare'
                            ? "bg-foreground text-background shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <GitCompare className="h-3.5 w-3.5" />
                    <span>Compare 2 Versions</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMode('audit');
                        setScanResult(null);
                    }}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        mode === 'audit'
                            ? "bg-foreground text-background shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Single Contract Audit</span>
                </button>
            </div>

            {/* Upload Grids */}
            <div className={cn("grid gap-4", mode === 'compare' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>{mode === 'compare' ? "1. Original Contract (Base)" : "Contract Agreement"}</span>
                    </span>
                    {!originalFile ? (
                        <PDFUploader
                            onFileSelect={(f) => setOriginalFile(f)}
                            title="Drop Original Version"
                            subtitle="Base agreement or your starting draft"
                            className="min-h-[140px] py-4"
                        />
                    ) : (
                        <div className="p-3 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground truncate max-w-[220px]">
                                {originalFile.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() => setOriginalFile(null)}
                            >
                                Change
                            </Button>
                        </div>
                    )}
                </div>

                {mode === 'compare' && (
                    <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span>2. Counterparty / Revised Version</span>
                        </span>
                        {!revisedFile ? (
                            <PDFUploader
                                onFileSelect={(f) => setRevisedFile(f)}
                                title="Drop Revised Version"
                                subtitle="Contract returned by client or counterparty"
                                className="min-h-[140px] py-4"
                            />
                        ) : (
                            <div className="p-3 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground truncate max-w-[220px]">
                                    {revisedFile.name}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px]"
                                    onClick={() => setRevisedFile(null)}
                                >
                                    Change
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scan Action */}
            <div className="flex justify-center">
                <Button
                    onClick={handleScan}
                    disabled={isScanning || !originalFile || (mode === 'compare' && !revisedFile)}
                    className="h-10 px-8 text-xs font-semibold gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Auditing Contract Liabilities &amp; Redlines...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            <span>Run AI Contract Risk Scan</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Results Presentation */}
            {scanResult && (
                <div className="space-y-6 pt-2">
                    {/* Score Ribbon */}
                    <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn(
                                        "h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-bold text-lg border",
                                        scanResult.overallRiskScore > 60
                                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                                            : scanResult.overallRiskScore > 30
                                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                    )}
                                >
                                    <span>{scanResult.overallRiskScore}</span>
                                    <span className="text-[9px] font-mono -mt-1">/100</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-foreground">
                                            {scanResult.riskLevel} Risk Assessment
                                        </h2>
                                        <span
                                            className={cn(
                                                "text-[10px] font-semibold px-2 py-0.5 rounded uppercase",
                                                scanResult.riskLevel === 'High'
                                                    ? "bg-red-500/15 text-red-600"
                                                    : scanResult.riskLevel === 'Medium'
                                                    ? "bg-amber-500/15 text-amber-600"
                                                    : "bg-emerald-500/15 text-emerald-600"
                                            )}
                                        >
                                            {scanResult.riskLevel} Risk
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {scanResult.flaggedClauses.length} critical clauses flagged for review
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadReportMarkdown}
                                className="h-8 text-xs gap-1.5 cursor-pointer self-start sm:self-auto"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Export Audit Report</span>
                            </Button>
                        </div>

                        <div className="text-xs text-foreground leading-relaxed bg-secondary/20 p-3 rounded-xl border border-border/50">
                            <span className="font-semibold block mb-1">Executive Summary:</span>
                            {scanResult.executiveSummary}
                        </div>
                    </div>

                    {/* Flagged Clauses Accordion/Cards */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground">
                            Flagged Clauses &amp; Counter-Proposals
                        </h3>

                        <div className="space-y-3">
                            {scanResult.flaggedClauses.map((clause, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl border border-border/70 bg-card space-y-3 shadow-xs"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-foreground flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    clause.severity === 'high'
                                                        ? "bg-red-500"
                                                        : clause.severity === 'medium'
                                                        ? "bg-amber-500"
                                                        : "bg-blue-500"
                                                )}
                                            />
                                            <span>{clause.title}</span>
                                        </span>

                                        <span
                                            className={cn(
                                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                                                clause.severity === 'high'
                                                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                                    : clause.severity === 'medium'
                                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                                    : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                            )}
                                        >
                                            {clause.severity}
                                        </span>
                                    </div>

                                    {/* Snippets Comparison */}
                                    {clause.revisedSnippet ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                                                    Original:
                                                </span>
                                                <p className="italic text-muted-foreground">{clause.originalSnippet}</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                                                <span className="text-[10px] font-bold text-red-600 uppercase block mb-1">
                                                    Counterparty Revision:
                                                </span>
                                                <p className="text-foreground">{clause.revisedSnippet}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        clause.originalSnippet && (
                                            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 text-xs italic text-muted-foreground">
                                                {clause.originalSnippet}
                                            </div>
                                        )
                                    )}

                                    {/* Risk Explanation & Recommendation */}
                                    <div className="space-y-1.5 pt-1 text-xs">
                                        <p className="text-foreground leading-relaxed">
                                            <strong className="text-red-600 dark:text-red-400">Risk Assessment: </strong>
                                            {clause.riskExplanation}
                                        </p>

                                        {clause.counterRecommendation && (
                                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                                                <strong className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                                                    Recommended Counter-Clause:
                                                </strong>
                                                <code className="text-xs font-mono select-all">
                                                    {clause.counterRecommendation}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
