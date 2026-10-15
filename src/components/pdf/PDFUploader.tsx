"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
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
    title = "Drop your document here", 
    subtitle = "Drag and drop or browse files locally from your device",
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
                "relative group flex flex-col items-center justify-center w-full min-h-[200px] rounded-xl border border-dashed transition-all duration-200 cursor-pointer p-6 text-center bg-card shadow-xs",
                isDragActive
                    ? "border-foreground bg-secondary/80 ring-1 ring-foreground/20"
                    : "border-border hover:border-foreground/40 hover:bg-secondary/40",
                className
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="h-10 w-10 rounded-[6px] bg-secondary flex items-center justify-center border border-border group-hover:scale-105 transition-transform">
                    {isDragActive ? (
                        <FileText className="h-4 w-4 text-foreground" />
                    ) : (
                        <Upload className="h-4 w-4 text-foreground" />
                    )}
                </div>

                <div className="space-y-1">
                    <p className="font-semibold text-xs sm:text-sm text-foreground">
                        {isDragActive ? "Release document to process" : title}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        {subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <span className="type-mono-eyebrow text-[9px] px-2 py-0.5 rounded-[4px] bg-secondary text-muted-foreground border border-border">
                        100% Private
                    </span>
                    <span className="type-mono-eyebrow text-[9px] text-muted-foreground">
                        Never leaves your device
                    </span>
                </div>
            </div>
        </div>
    );
}
