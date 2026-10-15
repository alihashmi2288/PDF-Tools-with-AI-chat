"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { convertEpubToPdf } from "@/lib/converters/epub-to-pdf";
import { 
    BookOpen, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Sparkles, 
    Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EpubToPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsConverting(true);
        setOutputPdfUrl(null);

        try {
            const pdfBytes = await convertEpubToPdf(selectedFile);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setOutputPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("EPUB to PDF conversion failed", err);
            alert("Error converting EPUB. Please ensure it is a valid .epub eBook.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-xs font-medium mb-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    eBook Converter
                </div>
                <h1 className="text-3xl font-bold tracking-tight">EPUB to PDF</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Convert eBook files (.epub) into printable, paginated PDF documents with elegant book typography.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        accept={{ 'application/epub+zip': ['.epub'] }}
                        title="Drop your EPUB eBook here"
                        subtitle="Upload .epub books to convert into paginated, printable PDFs"
                    />
                </div>
            ) : isConverting ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                    <p className="text-sm font-medium text-foreground">Reading EPUB spine and chapters...</p>
                    <p className="text-xs text-muted-foreground">Formatting book chapters into paginated A4 layout</p>
                </div>
            ) : outputPdfUrl && (
                <div className="space-y-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">eBook Converted to PDF!</h3>
                                <p className="text-xs text-muted-foreground">
                                    {file.name} formatted with chapter headings, page breaks, and running headers.
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
                                    Download PDF eBook
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
