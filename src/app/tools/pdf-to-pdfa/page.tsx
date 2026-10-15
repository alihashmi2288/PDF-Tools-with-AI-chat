"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertPdfToPdfA } from "@/lib/converters/pdf-to-pdfa";
import { 
    Archive, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    ShieldCheck, 
    Sparkles, 
    Award 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PdfToPdfaPage() {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [subject, setSubject] = useState("");
    const [isConverting, setIsConverting] = useState(false);
    const [pdfaUrl, setPdfaUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
        setPdfaUrl(null);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);

        try {
            const buffer = await file.arrayBuffer();
            const outputBytes = await convertPdfToPdfA(new Uint8Array(buffer), {
                title,
                author,
                subject,
            });

            const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
            setPdfaUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("PDF/A conversion failed", err);
            alert("Error converting to PDF/A. Please try again.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium mb-1">
                    <Award className="h-3.5 w-3.5" />
                    ISO 19005-1 Archival Standard
                </div>
                <h1 className="text-3xl font-bold tracking-tight">PDF to PDF/A (Archival Standard)</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Converts standard PDFs into ISO-compliant PDF/A-1b files with embedded color profiles and standardized XMP archival metadata for legal, court, and governmental records.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop PDF here for ISO PDF/A Archival"
                        subtitle="Upload legal briefs, patents, financial audits, or contracts"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-card border border-border/80 rounded-xl p-6 space-y-6 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Archival Metadata (ISO 19005-1)</h3>
                                <p className="text-xs text-muted-foreground">Standardized Dublin Core and Adobe XMP properties</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setPdfaUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                        </div>

                        {/* Metadata Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs mb-1 block">Document Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title of archived record"
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs mb-1 block">Author / Entity</Label>
                                <Input
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Author or organization"
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>

                        {/* Compliance checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg border border-border/60 bg-secondary/30 space-y-1">
                                <span className="font-semibold text-xs text-foreground block">XMP Dublin Core</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Embeds ISO PDF/A-1b extension schema with part 1 conformance B.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border border-border/60 bg-secondary/30 space-y-1">
                                <span className="font-semibold text-xs text-foreground block">OutputIntents Color Space</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Specifies standard sRGB IEC61966-2.1 color profile.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border border-border/60 bg-secondary/30 space-y-1">
                                <span className="font-semibold text-xs text-foreground block">Form Neutralization</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Neutralizes interactive fields to guarantee decades of rendering stability.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleConvert}
                            disabled={isConverting}
                            className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Encoding ISO PDF/A-1b Archival Packet...
                                </>
                            ) : (
                                <>
                                    <Award className="h-4 w-4 mr-2" />
                                    Generate ISO PDF/A File
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Download Banner */}
                    {pdfaUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">ISO PDF/A-1b Document Generated!</p>
                                    <p className="text-xs text-muted-foreground">
                                        Color profiles and archival metadata embedded successfully.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={pdfaUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_PDFA.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download PDF/A
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
