"use client";

import dynamic from "next/dynamic";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { FileText, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { useGlobalToolContext } from "@/context/GlobalToolContext";

const PDFEditor = dynamic(() => import("@/components/pdf/PDFEditor").then(mod => mod.PDFEditor), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-64 text-xs font-mono text-muted-foreground">
            Initializing PDF Canvas Editor...
        </div>
    ),
});

export default function EditPage() {
    const { edit, setEdit } = useGlobalToolContext();
    const { file } = edit;

    const handleFileSelect = (newFile: File) => {
        setEdit({ file: newFile });
    };

    return (
        <div className="max-w-5xl py-2 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center border border-border/60">
                            <SlidersHorizontal className="h-4 w-4 text-foreground" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Smart PDF Editor
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Annotate, redact sensitive information, and overlay text directly on PDF canvases.
                    </p>
                </div>
            </div>

            {!file ? (
                <div className="max-w-xl mx-auto py-6">
                    <PDFUploader 
                        onFileSelect={handleFileSelect} 
                        title="Select PDF document to annotate and edit"
                    />
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl bg-card shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center border border-border/60">
                                <FileText className="h-4.5 w-4.5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground tabular-nums">
                                    {(file.size / 1024).toFixed(1)} KB • Active in local canvas
                                </p>
                            </div>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setEdit({ file: null })}
                        >
                            Change File
                        </Button>
                    </div>

                    <div className="border border-border/70 rounded-xl bg-card p-4 shadow-xs">
                        <PDFEditor file={file} />
                    </div>
                </div>
            )}
        </div>
    );
}
