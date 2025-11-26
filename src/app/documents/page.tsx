"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
const PDFUploader = dynamic(() => import("@/components/pdf/PDFUploader").then(mod => mod.PDFUploader), {
    ssr: false,
    loading: () => <p>Loading Uploader...</p>,
});

const PDFViewer = dynamic(() => import("@/components/pdf/PDFViewer").then(mod => mod.PDFViewer), {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
});
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";
import { X, MessageSquare } from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { usePDFContext } from "@/context/PDFContext";

export default function DocumentsPage() {
    const { file: selectedFile, setFile: setSelectedFile, setPdfText, pdfText } = usePDFContext();
    const [showChat, setShowChat] = useState(true);

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        const text = await extractTextFromPDF(file);
        setPdfText(text);
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPdfText("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                <div className="flex gap-2">
                    {selectedFile && (
                        <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {showChat ? "Hide Chat" : "Show Chat"}
                        </Button>
                    )}
                    {selectedFile && (
                        <Button variant="destructive" size="sm" onClick={clearFile}>
                            <X className="mr-2 h-4 w-4" />
                            Close Document
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                <div className={`flex-1 flex flex-col items-center justify-center border rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 overflow-hidden transition-all duration-300 ${showChat && selectedFile ? 'w-1/2' : 'w-full'}`}>
                    {!selectedFile ? (
                        <div className="w-full max-w-xl">
                            <PDFUploader onFileSelect={handleFileSelect} />
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-auto">
                            <PDFViewer file={selectedFile} />
                        </div>
                    )}
                </div>

                {selectedFile && showChat && (
                    <div className="w-1/3 border rounded-lg bg-background flex flex-col transition-all duration-300">
                        <div className="p-4 border-b font-semibold">Chat with PDF</div>
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface context={pdfText} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
