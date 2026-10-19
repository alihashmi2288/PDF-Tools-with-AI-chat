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
                "relative group flex flex-col items-center justify-center w-full min-h-[190px] rounded-[14px] border border-dashed transition-all duration-200 cursor-pointer p-6 sm:p-8 text-center bg-surface-1 shadow-xs paper-empty-sheet",
                isDragActive
                    ? "border-primary bg-surface-2 ring-2 ring-primary/30"
                    : "border-hairline-strong hover:border-hairline-tertiary hover:bg-surface-2/60",
                className
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="h-11 w-11 rounded-[9px] bg-surface-2 flex items-center justify-center border border-hairline group-hover:scale-105 transition-transform shadow-xs">
                    {isDragActive ? (
                        <FileText className="h-5 w-5 text-primary" />
                    ) : (
                        <Upload className="h-5 w-5 text-ink" />
                    )}
                </div>

                <div className="space-y-1">
                    <p className="font-semibold text-xs sm:text-sm text-ink">
                        {isDragActive ? "Release document to process" : title}
                    </p>
                    <p className="text-xs text-ink-subtle max-w-sm">
                        {subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <span className="paper-citation-pill text-[9px] py-0.5 px-2">
                        100% Private
                    </span>
                    <span className="type-mono-eyebrow text-[9px] text-ink-tertiary">
                        Never leaves your device
                    </span>
                </div>
            </div>
        </div>
    );
}
