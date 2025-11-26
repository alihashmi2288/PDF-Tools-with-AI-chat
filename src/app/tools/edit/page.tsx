"use client";

import dynamic from "next/dynamic";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useGlobalToolContext } from "@/context/GlobalToolContext";

const PDFEditor = dynamic(() => import("@/components/pdf/PDFEditor").then(mod => mod.PDFEditor), {
    ssr: false,
    loading: () => <p>Loading PDF Editor...</p>,
});

export default function EditPage() {
    const { edit, setEdit } = useGlobalToolContext();
    const { file } = edit;

    const handleFileSelect = (newFile: File) => {
        setEdit({ file: newFile });
    };

    return (
        <div className="container max-w-6xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Edit PDF</h1>
                <p className="text-muted-foreground">
                    Add text and redact content.
                </p>
            </div>

            {!file ? (
                <div className="h-64 max-w-2xl mx-auto">
                    <PDFUploader onFileSelect={handleFileSelect} />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-4">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEdit({ file: null })}>
                            Change File
                        </Button>
                    </div>

                    <PDFEditor file={file} />
                </div>
            )}
        </div>
    );
}
