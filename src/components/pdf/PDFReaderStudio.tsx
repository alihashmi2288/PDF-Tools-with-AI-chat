"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { 
    X, 
    BookOpen, 
    PanelRightClose, 
    PanelRightOpen, 
    SlidersHorizontal,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { usePDFContext } from "@/context/PDFContext";
import { useGlobalToolContext } from "@/context/GlobalToolContext";

const PDFViewer = dynamic(() => import("@/components/pdf/PDFViewer").then(mod => mod.PDFViewer), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
            Loading document renderer...
        </div>
    ),
});

export function PDFReaderStudio() {
    const router = useRouter();
    const { file: selectedFile, setFile: setSelectedFile, setPdfText, pdfText } = usePDFContext();
    const { setEdit } = useGlobalToolContext();
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

    const handleOpenInEditor = () => {
        if (selectedFile) {
            setEdit({ file: selectedFile });
            router.push("/tools/edit");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 font-semibold">
                        <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold tracking-tight text-foreground truncate max-w-sm sm:max-w-md">
                                {selectedFile ? selectedFile.name : "PDF Reader & AI Companion"}
                            </h1>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/60">
                                100% Private
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {selectedFile 
                                ? `${(selectedFile.size / 1024).toFixed(1)} KB • Active in browser memory`
                                : "Clean distraction-free reading, zoom controls, and instant AI explanations"
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {selectedFile && (
                        <>
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
                                onClick={handleOpenInEditor}
                                title="Pass document directly into canvas annotation & text editor"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                <span>Edit in PDF Editor</span>
                            </Button>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5"
                                onClick={() => setShowChat(!showChat)}
                            >
                                {showChat ? (
                                    <>
                                        <PanelRightClose className="h-3.5 w-3.5" />
                                        <span>Hide AI</span>
                                    </>
                                ) : (
                                    <>
                                        <PanelRightOpen className="h-3.5 w-3.5" />
                                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
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
                                title="Open PDF in Precision Reader"
                                subtitle="Comfortable reading, zoom, page rotation, and side-by-side AI assistant"
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
                    <div className="hidden lg:flex w-5/12 h-full overflow-hidden flex-col border border-border/70 rounded-xl bg-card shadow-xs">
                        <ChatInterface context={pdfText} />
                    </div>
                )}
            </div>
        </div>
    );
}
