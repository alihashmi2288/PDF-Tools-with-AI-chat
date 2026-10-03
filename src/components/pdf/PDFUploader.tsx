"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFUploaderProps {
    onFileSelect: (file: File) => void;
    title?: string;
    subtitle?: string;
    accept?: Record<string, string[]>;
    className?: string;
}

export function PDFUploader({ 
    onFileSelect, 
    title = "Drop your PDF document here", 
    subtitle = "Drag and drop or browse from your device",
    accept = { "application/pdf": [".pdf"] },
    className
}: PDFUploaderProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative group flex flex-col items-center justify-center w-full min-h-[220px] rounded-xl border transition-all duration-200 cursor-pointer p-6 text-center bg-card/60 backdrop-blur-xs",
                isDragActive
                    ? "border-foreground bg-accent/40 ring-2 ring-foreground/10"
                    : "border-border/80 hover:border-foreground/40 hover:bg-card/90",
                className
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center space-y-3.5 pointer-events-none">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center border border-border/70 group-hover:scale-105 transition-transform">
                    {isDragActive ? (
                        <FileText className="h-6 w-6 text-foreground animate-bounce" />
                    ) : (
                        <Upload className="h-5 w-5 text-foreground" />
                    )}
                </div>

                <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">
                        {isDragActive ? "Release to drop document" : title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50">
                        Client Sandbox
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        PDF up to 50MB
                    </span>
                </div>
            </div>
        </div>
    );
}
