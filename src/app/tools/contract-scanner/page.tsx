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
        <div className="max-w-4xl mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 border-b border-hairline pb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Scale className="h-4 w-4" />
                    </div>
                    <h1 className="type-headline text-ink">
                        AI Contract Redliner &amp; Risk Scanner
                    </h1>
                </div>
                <p className="type-subhead text-ink-subtle">
                    Compare two PDF contract versions side-by-side or scan a single agreement to detect added liabilities, altered numbers, and trap clauses.
                </p>
            </div>

            {/* Mode Selector */}
            <div className="filter-toggle-container inline-flex p-1 bg-surface-1 border border-hairline rounded-full max-w-md">
                <button
                    type="button"
                    onClick={() => {
                        setMode('compare');
                        setScanResult(null);
                    }}
                    className={cn(
                        "filter-toggle-pill flex-1 py-1.5 px-4 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        mode === 'compare'
                            ? "filter-toggle-pill-active"
                            : "text-ink-subtle hover:text-ink"
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
                        "filter-toggle-pill flex-1 py-1.5 px-4 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        mode === 'audit'
                            ? "filter-toggle-pill-active"
                            : "text-ink-subtle hover:text-ink"
                    )}
                >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Single Contract Audit</span>
                </button>
            </div>

            {/* Upload Grids */}
            <div className={cn("grid gap-4", mode === 'compare' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                <div className="hairline-card p-5 rounded-[12px] bg-surface-1 space-y-3">
                    <span className="type-eyebrow text-ink flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
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
                        <div className="p-3 rounded-[8px] border border-hairline bg-surface-2 flex items-center justify-between text-xs">
                            <span className="font-medium text-ink truncate max-w-[220px]">
                                {originalFile.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[11px] rounded-[6px]"
                                onClick={() => setOriginalFile(null)}
                            >
                                Change
                            </Button>
                        </div>
                    )}
                </div>

                {mode === 'compare' && (
                    <div className="hairline-card p-5 rounded-[12px] bg-surface-1 space-y-3">
                        <span className="type-eyebrow text-ink flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#f2994a]" />
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
                            <div className="p-3 rounded-[8px] border border-hairline bg-surface-2 flex items-center justify-between text-xs">
                                <span className="font-medium text-ink truncate max-w-[220px]">
                                    {revisedFile.name}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[11px] rounded-[6px]"
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
            <div className="flex justify-center pt-2">
                <Button
                    onClick={handleScan}
                    disabled={isScanning || !originalFile || (mode === 'compare' && !revisedFile)}
                    className="button-primary h-10 px-8 text-xs font-medium gap-2 cursor-pointer rounded-[8px]"
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
                <div className="space-y-6 pt-4">
                    {/* Score Ribbon */}
                    <div className="hairline-card p-5 rounded-[12px] bg-surface-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn(
                                        "h-14 w-14 rounded-[10px] flex flex-col items-center justify-center font-bold text-lg border",
                                        scanResult.overallRiskScore > 60
                                            ? "bg-[#eb5757]/10 text-[#eb5757] border-[#eb5757]/30"
                                            : scanResult.overallRiskScore > 30
                                            ? "bg-[#f2994a]/10 text-[#f2994a] border-[#f2994a]/30"
                                            : "bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/30"
                                    )}
                                >
                                    <span>{scanResult.overallRiskScore}</span>
                                    <span className="text-[10px] font-mono -mt-1 opacity-70">/100</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="type-card-title text-ink">
                                            {scanResult.riskLevel} Risk Assessment
                                        </h2>
                                        <span
                                            className={cn(
                                                "status-badge text-[10px] uppercase font-mono tracking-wider",
                                                scanResult.riskLevel === 'High'
                                                    ? "bg-[#eb5757]/15 text-[#eb5757] border-[#eb5757]/30"
                                                    : scanResult.riskLevel === 'Medium'
                                                    ? "bg-[#f2994a]/15 text-[#f2994a] border-[#f2994a]/30"
                                                    : "bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30"
                                            )}
                                        >
                                            {scanResult.riskLevel} Risk
                                        </span>
                                    </div>
                                    <p className="type-caption text-ink-subtle mt-0.5">
                                        {scanResult.flaggedClauses.length} critical clauses flagged for review
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadReportMarkdown}
                                className="button-secondary h-8 text-xs gap-1.5 cursor-pointer self-start sm:self-auto rounded-[8px]"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Export Audit Report</span>
                            </Button>
                        </div>

                        <div className="paper-sheet p-4 text-xs text-ink leading-relaxed border border-paper-border">
                            <span className="type-eyebrow text-ink font-semibold block mb-1">Executive Summary:</span>
                            <p className="paper-prose text-xs text-ink-muted leading-relaxed">
                                {scanResult.executiveSummary}
                            </p>
                        </div>
                    </div>

                    {/* Flagged Clauses Accordion/Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-hairline pb-2">
                            <h3 className="type-card-title text-ink">
                                Flagged Clauses &amp; Counter-Proposals
                            </h3>
                            <span className="type-mono-eyebrow text-[10px] text-ink-subtle">
                                {scanResult.flaggedClauses.length} Issues Identified
                            </span>
                        </div>

                        <div className="space-y-3">
                            {scanResult.flaggedClauses.map((clause, idx) => (
                                <div
                                    key={idx}
                                    className="paper-sheet p-4.5 rounded-[10px] space-y-3 border border-paper-border shadow-xs"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-xs text-ink flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    clause.severity === 'high'
                                                        ? "bg-[#eb5757]"
                                                        : clause.severity === 'medium'
                                                        ? "bg-[#f2994a]"
                                                        : "bg-primary"
                                                )}
                                            />
                                            <span>{clause.title}</span>
                                        </span>

                                        <span
                                            className={cn(
                                                "status-badge text-[10px] font-mono uppercase px-2 py-0.5",
                                                clause.severity === 'high'
                                                    ? "bg-[#eb5757]/10 text-[#eb5757] border-[#eb5757]/20"
                                                    : clause.severity === 'medium'
                                                    ? "bg-[#f2994a]/10 text-[#f2994a] border-[#f2994a]/20"
                                                    : "bg-primary/10 text-primary border-primary/20"
                                            )}
                                        >
                                            {clause.severity}
                                        </span>
                                    </div>

                                    {/* Snippets Comparison: Paper Document Excerpts */}
                                    {clause.revisedSnippet ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                            <div className="p-3 rounded-[6px] bg-surface-2/60 border-l-2 border-hairline-strong border border-hairline">
                                                <span className="type-eyebrow text-ink-subtle block mb-1 text-[10px]">
                                                    Original Contract Excerpt:
                                                </span>
                                                <p className="text-ink-subtle text-xs italic leading-relaxed">&ldquo;{clause.originalSnippet}&rdquo;</p>
                                            </div>
                                            <div className="p-3 rounded-[6px] bg-[#eb5757]/5 border-l-2 border-[#eb5757] border border-[#eb5757]/20">
                                                <span className="type-eyebrow text-[#eb5757] block mb-1 text-[10px]">
                                                    Counterparty Revision:
                                                </span>
                                                <p className="text-ink text-xs leading-relaxed">&ldquo;{clause.revisedSnippet}&rdquo;</p>
                                            </div>
                                        </div>
                                    ) : (
                                        clause.originalSnippet && (
                                            <div className="p-3 rounded-[6px] bg-surface-2/60 border-l-2 border-hairline-strong border border-hairline text-xs italic text-ink-subtle leading-relaxed">
                                                &ldquo;{clause.originalSnippet}&rdquo;
                                            </div>
                                        )
                                    )}

                                    {/* Risk Explanation & Recommendation */}
                                    <div className="space-y-2 pt-1 text-xs">
                                        <p className="text-ink leading-relaxed">
                                            <strong className="text-[#eb5757]">Risk Assessment: </strong>
                                            {clause.riskExplanation}
                                        </p>

                                        {clause.counterRecommendation && (
                                            <div className="p-3 rounded-[6px] bg-[#16a34a]/10 border-l-2 border-[#16a34a] border border-[#16a34a]/20 text-ink">
                                                <strong className="block type-eyebrow text-[#16a34a] mb-1 text-[10px]">
                                                    Recommended Counter-Clause:
                                                </strong>
                                                <code className="text-xs font-mono select-all text-ink block whitespace-pre-wrap leading-relaxed">
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
