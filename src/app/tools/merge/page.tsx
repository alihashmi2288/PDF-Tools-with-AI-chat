"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, X, ArrowDown, Download } from "lucide-react";
import { mergePDFs } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { useGlobalToolContext } from "@/context/GlobalToolContext";

export default function MergePage() {
    const { merge, setMerge } = useGlobalToolContext();
    const { files, isMerging, mergedPdfUrl } = merge;

    const onDrop = (acceptedFiles: File[]) => {
        // Filter for PDFs just in case
        const newFiles = acceptedFiles.filter(f => f.type === "application/pdf");
        setMerge({
            files: [...files, ...newFiles],
            mergedPdfUrl: null // Reset previous merge
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
    });

    const removeFile = (index: number) => {
        setMerge({
            files: files.filter((_, i) => i !== index),
            mergedPdfUrl: null
        });
    };

    const moveFile = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === files.length - 1)
        ) {
            return;
        }

        const newFiles = [...files];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];

        setMerge({
            files: newFiles,
            mergedPdfUrl: null
        });
    };

    const handleMerge = async () => {
        if (files.length < 2) return;
        setMerge({ isMerging: true });

        try {
            const fileBuffers = await Promise.all(
                files.map(file => file.arrayBuffer().then(buffer => new Uint8Array(buffer)))
            );

            const mergedPdfBytes = await mergePDFs(fileBuffers);
            const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setMerge({ mergedPdfUrl: url });
        } catch (error) {
            console.error("Merge failed:", error);
            alert("Failed to merge PDFs. Please try again.");
        } finally {
            setMerge({ isMerging: false });
        }
    };

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Merge PDFs</h1>
                <p className="text-muted-foreground">
                    Combine multiple PDF files into a single document. Drag and drop to reorder.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Upload Area */}
                <div className="space-y-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors h-64 flex flex-col items-center justify-center",
                            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:bg-muted/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <ArrowDown className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="font-medium">Drop PDFs here</p>
                        <p className="text-sm text-muted-foreground">or click to select files</p>
                    </div>

                    <Button
                        onClick={handleMerge}
                        disabled={files.length < 2 || isMerging}
                        className="w-full"
                        size="lg"
                    >
                        {isMerging ? "Merging..." : "Merge PDFs"}
                    </Button>
                </div>

                {/* File List */}
                <Card className="h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                        <h3 className="font-semibold mb-4">Selected Files ({files.length})</h3>
                        {files.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic">
                                No files selected
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
                                {files.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-md group">
                                        <div className="flex items-center overflow-hidden">
                                            <FileText className="h-4 w-4 mr-3 flex-shrink-0 text-blue-500" />
                                            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveFile(index, "up")} disabled={index === 0}>↑</Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveFile(index, "down")} disabled={index === files.length - 1}>↓</Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeFile(index)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Result */}
            {mergedPdfUrl && (
                <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Merge Complete!</h3>
                            <p className="text-sm text-green-700 dark:text-green-300">Your document is ready for download.</p>
                        </div>
                    </div>
                    <a href={mergedPdfUrl} download="merged-document.pdf">
                        <Button className="gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </a>
                </div>
            )}
        </div>
    );
}

