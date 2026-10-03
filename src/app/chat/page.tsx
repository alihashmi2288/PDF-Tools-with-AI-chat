"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { usePDFContext } from "@/context/PDFContext";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, X, ShieldCheck } from "lucide-react";
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
        <div className="max-w-4xl py-2 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Document Chat Assistant
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Converse directly with loaded document contents, summarize sections, and extract key metrics.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-secondary border border-border/50">
                        {file ? "Document Loaded" : "General Mode"}
                    </span>
                </div>
            </div>

            {/* Document Context Ribbon / Intake Dropzone */}
            {!file ? (
                <div className="p-4 border border-border/70 rounded-xl bg-card space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                            Load PDF for Document-Specific Q&A (Optional)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            You can also chat in general mode below
                        </span>
                    </div>
                    <PDFUploader 
                        onFileSelect={handleFileSelect}
                        title="Drop PDF to chat with its contents"
                        subtitle="Extracts text directly into local AI memory"
                        className="min-h-[140px] py-4"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 border border-border/70 rounded-xl bg-card shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center border border-border/60">
                            <FileText className="h-4 w-4 text-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                                {file.name}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                                {(file.size / 1024).toFixed(1)} KB • {pdfText.length} characters in context
                            </p>
                        </div>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        onClick={clearFile}
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Detach
                    </Button>
                </div>
            )}

            {/* Chat Container */}
            <div className="h-[520px]">
                <ChatInterface context={pdfText} />
            </div>
        </div>
    );
}
