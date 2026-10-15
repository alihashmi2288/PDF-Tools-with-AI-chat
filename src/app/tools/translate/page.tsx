"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { 
    Languages, 
    Download, 
    Loader2, 
    Sparkles, 
    CheckCircle2, 
    Copy, 
    Check, 
    ArrowRightLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslationParagraph {
    original: string;
    translated: string;
}

interface TranslationResult {
    targetLanguage: string;
    direction: 'ltr' | 'rtl';
    title: string;
    translatedText: string;
    paragraphs: TranslationParagraph[];
}

const LANGUAGES = [
    { code: 'ur', name: 'Urdu (اردو)', isRtl: true },
    { code: 'ar', name: 'Arabic (العربية)', isRtl: true },
    { code: 'es', name: 'Spanish (Español)', isRtl: false },
    { code: 'fr', name: 'French (Français)', isRtl: false },
    { code: 'de', name: 'German (Deutsch)', isRtl: false },
    { code: 'zh', name: 'Chinese (中文)', isRtl: false },
    { code: 'ja', name: 'Japanese (日本語)', isRtl: false },
    { code: 'hi', name: 'Hindi (हिन्दी)', isRtl: false },
    { code: 'pt', name: 'Portuguese (Português)', isRtl: false },
    { code: 'ru', name: 'Russian (Русский)', isRtl: false },
    { code: 'it', name: 'Italian (Italiano)', isRtl: false },
];

export default function DocumentTranslatorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [targetLang, setTargetLang] = useState('Spanish (Español)');
    const [isTranslating, setIsTranslating] = useState(false);
    const [result, setResult] = useState<TranslationResult | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setResult(null);
    };

    const handleTranslate = async () => {
        if (!file) return;
        setIsTranslating(true);
        setResult(null);

        try {
            const text = await extractTextFromPDF(file);
            const res = await fetch("/api/ai/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    targetLanguage: targetLang,
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to translate document");
            }

            const data: TranslationResult = await res.json();
            setResult(data);
        } catch (err: any) {
            console.error("Translation failed:", err);
            alert("Failed to translate document: " + (err?.message || "Unknown error"));
        } finally {
            setIsTranslating(false);
        }
    };

    const copyTranslatedText = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.translatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadTranslatedText = () => {
        if (!result) return;
        const blob = new Blob([result.translatedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file?.name.replace(/\.pdf$/i, '')}_${result.targetLanguage}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                        <Languages className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        AI Full-Document Translator
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Translate entire PDF documents into Urdu, Arabic, Spanish, French, German, or Chinese while preserving paragraph structures and bidirectional reading formats.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop PDF to translate"
                    subtitle="Multi-language translation with side-by-side bilingual view"
                />
            ) : (
                <div className="space-y-6">
                    {/* Language Selection Ribbon */}
                    <div className="p-5 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                            <span className="font-semibold text-xs text-foreground truncate max-w-sm">
                                {file.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground"
                                onClick={() => {
                                    setFile(null);
                                    setResult(null);
                                }}
                            >
                                Change Document
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-foreground">
                                    Target Language:
                                </span>
                                <select
                                    value={targetLang}
                                    onChange={(e) => setTargetLang(e.target.value)}
                                    className="w-full h-9 px-3 text-xs rounded-lg border border-border/70 bg-card text-foreground cursor-pointer font-medium"
                                >
                                    {LANGUAGES.map((lang) => (
                                        <option key={lang.code} value={lang.name}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <Button
                                    onClick={handleTranslate}
                                    disabled={isTranslating}
                                    className="h-9 text-xs font-semibold gap-2 cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white"
                                >
                                    {isTranslating ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            <span>Translating Document Layout...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-3.5 w-3.5" />
                                            <span>Translate to {targetLang}</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bilingual Side-by-Side Results View */}
                    {result && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-semibold text-foreground">
                                        Translated into {result.targetLanguage}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 cursor-pointer"
                                        onClick={copyTranslatedText}
                                    >
                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        <span>{copied ? "Copied" : "Copy Text"}</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white"
                                        onClick={downloadTranslatedText}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Download Translated Text</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Paragraph by paragraph bilingual cards */}
                            <div className="space-y-3">
                                {result.paragraphs && result.paragraphs.length > 0 ? (
                                    result.paragraphs.map((para, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl border border-border/70 bg-card shadow-xs text-xs"
                                        >
                                            <div className="p-3 rounded-lg bg-secondary/30 text-muted-foreground leading-relaxed">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                                                    Original:
                                                </span>
                                                {para.original}
                                            </div>

                                            <div
                                                dir={result.direction}
                                                className={cn(
                                                    "p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-foreground leading-relaxed",
                                                    result.direction === 'rtl' ? "text-right font-serif text-sm" : ""
                                                )}
                                            >
                                                <span className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400 block mb-1">
                                                    {result.targetLanguage}:
                                                </span>
                                                {para.translated}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        dir={result.direction}
                                        className={cn(
                                            "p-5 rounded-xl border border-border/70 bg-card whitespace-pre-wrap leading-relaxed text-xs",
                                            result.direction === 'rtl' ? "text-right font-serif text-sm" : ""
                                        )}
                                    >
                                        {result.translatedText}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
