"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { convertPptxToPdf } from "@/lib/converters/pptx-to-pdf";
import { 
    Presentation, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Sparkles, 
    Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PptxToPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsConverting(true);
        setOutputPdfUrl(null);

        try {
            const pdfBytes = await convertPptxToPdf(selectedFile);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setOutputPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("PPTX conversion failed", err);
            alert("Error converting PowerPoint presentation. Please ensure it is a valid .pptx file.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium mb-1">
                    <Presentation className="h-3.5 w-3.5" />
                    Presentation Converter
                </div>
                <h1 className="text-3xl font-bold tracking-tight">PowerPoint to PDF (.pptx to PDF)</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Convert PowerPoint presentations (.pptx) into crisp, shareable 16:9 widescreen PDF documents.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        accept={{
                            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
                        }}
                        title="Drop your PowerPoint (.pptx) file here"
                        subtitle="Upload presentation decks, slide outlines, or meeting decks"
                    />
                </div>
            ) : isConverting ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                    <p className="text-sm font-medium text-foreground">Converting PowerPoint slides to PDF...</p>
                    <p className="text-xs text-muted-foreground">Extracting slide XML shapes, typography, and bullet hierarchies</p>
                </div>
            ) : outputPdfUrl && (
                <div className="space-y-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Presentation Converted!</h3>
                                <p className="text-xs text-muted-foreground">
                                    {file.name} is ready for sharing and printing as a 16:9 PDF.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setOutputPdfUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Convert Another
                            </Button>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={outputPdfUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download PDF Slides
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
