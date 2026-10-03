"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, FileText, PanelRightClose, PanelRightOpen, ShieldCheck } from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { usePDFContext } from "@/context/PDFContext";

const PDFViewer = dynamic(() => import("@/components/pdf/PDFViewer").then(mod => mod.PDFViewer), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
            Loading document renderer...
        </div>
    ),
});

export default function DocumentsPage() {
    const { file: selectedFile, setFile: setSelectedFile, setPdfText, pdfText } = usePDFContext();
    const [showChat, setShowChat] = useState(true);

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        try {
            const text = await extractTextFromPDF(file);
            setPdfText(text);
        } catch (e) {
            console.error("Text extraction notice:", e);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPdfText("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                        <FileText className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight text-foreground truncate max-w-sm sm:max-w-md">
                            {selectedFile ? selectedFile.name : "Document Viewer & Studio"}
                        </h1>
                        {selectedFile && (
                            <p className="text-[11px] font-mono text-muted-foreground tabular-nums">
                                {(selectedFile.size / 1024).toFixed(1)} KB • Active in browser memory
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {selectedFile && (
                        <>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5"
                                onClick={() => setShowChat(!showChat)}
                            >
                                {showChat ? (
                                    <>
                                        <PanelRightClose className="h-3.5 w-3.5" />
                                        <span>Hide Chat</span>
                                    </>
                                ) : (
                                    <>
                                        <PanelRightOpen className="h-3.5 w-3.5" />
                                        <span>AI Assistant</span>
                                    </>
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                onClick={clearFile}
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Close
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                {/* Document Viewer Screen */}
                <div className={`flex-1 flex flex-col items-center justify-center border border-border/70 rounded-xl bg-card overflow-hidden transition-all duration-300 shadow-xs ${showChat && selectedFile ? 'w-full lg:w-7/12' : 'w-full'}`}>
                    {!selectedFile ? (
                        <div className="w-full max-w-lg p-6">
                            <PDFUploader 
                                onFileSelect={handleFileSelect} 
                                title="Open PDF in Precision Viewer"
                                subtitle="Annotate, inspect pages, and converse with document contents"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-hidden">
                            <PDFViewer file={selectedFile} />
                        </div>
                    )}
                </div>

                {/* AI Assistant Sidecar */}
                {selectedFile && showChat && (
                    <div className="hidden lg:flex w-5/12 h-full overflow-hidden flex-col">
                        <ChatInterface context={pdfText} />
                    </div>
                )}
            </div>
        </div>
    );
}
