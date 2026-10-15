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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                            <Sparkles className="h-3.5 w-3.5 text-foreground" />
                        </div>
                        <h1 className="type-heading-md text-foreground">
                            Document Chat Assistant
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Converse directly with loaded document contents, summarize sections, and extract key metrics.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="type-mono-eyebrow text-[10px] text-muted-foreground px-2 py-1 rounded-[4px] bg-card border border-border">
                        {file ? "DOCUMENT CONTEXT ACTIVE" : "GENERAL CONSOLE"}
                    </span>
                </div>
            </div>

            {/* Document Ribbon / Upload Area */}
            {!file ? (
                <div className="p-4 border border-border rounded-xl bg-card space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="type-mono-eyebrow text-[10px] text-foreground font-semibold">
                          Attach Document To Ask Questions
                        </span>
                        <span className="type-mono-eyebrow text-[10px] text-muted-foreground">
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
                <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-card shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                            <FileText className="h-4 w-4 text-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                                {file.name}
                            </p>
                            <p className="type-mono-eyebrow text-[10px] text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB • Ready for questions
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
            <div className="h-[530px]">
                <ChatInterface context={pdfText} />
            </div>
        </div>
    );
}
