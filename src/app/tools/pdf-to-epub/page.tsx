"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertPdfToEpub } from "@/lib/converters/pdf-to-epub";
import { 
    Book, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Sparkles, 
    Tablet 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PdfToEpubPage() {
    const [file, setFile] = useState<File | null>(null);
    const [bookTitle, setBookTitle] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [isConverting, setIsConverting] = useState(false);
    const [outputEpubUrl, setOutputEpubUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setBookTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
        setOutputEpubUrl(null);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);

        try {
            const epubBytes = await convertPdfToEpub(file, {
                title: bookTitle || file.name.replace(/\.[^/.]+$/, ''),
                author: authorName || 'PDFKit',
            });

            const blob = new Blob([epubBytes as any], { type: 'application/epub+zip' });
            setOutputEpubUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("PDF to EPUB conversion failed", err);
            alert("Error converting PDF to EPUB. Please try again.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium mb-1">
                    <Tablet className="h-3.5 w-3.5" />
                    eBook Converter
                </div>
                <h1 className="text-3xl font-bold tracking-tight">PDF to EPUB eBook</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Convert fixed-layout PDFs into reflowable, standard EPUB 3 eBooks for Kindle, Apple Books, Kobo, and mobile readers.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop PDF here to convert to EPUB eBook"
                        subtitle="Upload books, essays, research papers, or manuals"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-card border border-border/80 rounded-xl p-6 space-y-6 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">eBook Metadata</h3>
                                <p className="text-xs text-muted-foreground">Customize book title and author metadata for your e-reader library</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setOutputEpubUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs mb-1 block">Book Title</Label>
                                <Input
                                    value={bookTitle}
                                    onChange={(e) => setBookTitle(e.target.value)}
                                    placeholder="Enter book title"
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs mb-1 block">Author / Creator</Label>
                                <Input
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Author name"
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleConvert}
                            disabled={isConverting}
                            className="w-full h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Compiling Reflowable EPUB...
                                </>
                            ) : (
                                <>
                                    <Tablet className="h-4 w-4 mr-2" />
                                    Generate .epub eBook
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Download Banner */}
                    {outputEpubUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">EPUB eBook Ready!</p>
                                    <p className="text-xs text-muted-foreground">
                                        Compatible with Kindle, Apple Books, and Android readers.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={outputEpubUrl} download={`${bookTitle || 'ebook'}.epub`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download .epub
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
