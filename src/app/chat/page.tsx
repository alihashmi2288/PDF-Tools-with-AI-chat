"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { usePDFContext } from "@/context/PDFContext";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, X } from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdf-utils";

export default function ChatPage() {
    const { file, setFile, pdfText, setPdfText } = usePDFContext();
    const [isExtracting, setIsExtracting] = useState(false);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsExtracting(true);
        try {
            const text = await extractTextFromPDF(selectedFile);
            setPdfText(text);
        } catch (e) {
            console.error("Text extraction failed:", e);
        } finally {
            setIsExtracting(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPdfText("");
    };

    return (
        <div className="max-w-4xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-[8px] bg-primary/15 flex items-center justify-center border border-primary/25">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="type-headline text-ink">
                            Document Chat Assistant
                        </h1>
                    </div>
                    <p className="text-xs text-ink-subtle">
                        Converse directly with loaded document contents, summarize sections, and extract key metrics.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="type-mono-eyebrow text-[10px] text-ink-muted px-2.5 py-1 rounded-full bg-surface-2 border border-hairline">
                        {file ? "DOCUMENT CONTEXT ACTIVE" : "GENERAL CONSOLE"}
                    </span>
                </div>
            </div>

            {/* Document Ribbon / Upload Area */}
            {!file ? (
                <div className="p-4 border border-hairline rounded-[12px] bg-surface-1 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="type-eyebrow text-[11px] text-ink font-semibold uppercase tracking-[0.4px]">
                          Attach Document To Ask Questions
                        </span>
                        <span className="type-mono-eyebrow text-[10px] text-ink-subtle">
                          Optional
                        </span>
                    </div>
                    <PDFUploader 
                        onFileSelect={handleFileSelect}
                        title="Drop any PDF to ask questions"
                        subtitle="Fast, private reading directly on your device"
                        className="min-h-[130px] py-4"
                    />
                </div>
            ) : (
                <div className="paper-sheet paper-sheet-stacked flex items-center justify-between p-3.5 border border-paper-border shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline shadow-xs">
                            <FileText className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-ink truncate max-w-xs sm:max-w-md">
                                    {file.name}
                                </p>
                                <span className="paper-citation-pill text-[9px] py-0 px-1.5">
                                    Active Context
                                </span>
                            </div>
                            <p className="type-mono-eyebrow text-[10px] text-ink-subtle mt-0.5">
                                {(file.size / 1024).toFixed(1)} KB • Extracted in memory • Ready for citations
                            </p>
                        </div>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-ink-subtle hover:text-ink cursor-pointer"
                        onClick={clearFile}
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Detach
                    </Button>
                </div>
            )}

            {/* Chat Container */}
            <div className="h-[530px]">
                <ChatInterface context={pdfText} />
            </div>
        </div>
    );
}
