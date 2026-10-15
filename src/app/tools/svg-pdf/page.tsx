"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { convertSvgToPdf, convertPdfToSvg } from "@/lib/converters/svg-pdf";
import { 
    Shapes, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    ArrowRightLeft, 
    FileArchive, 
    Eye 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SvgPdfPage() {
    const [direction, setDirection] = useState<'svg-to-pdf' | 'pdf-to-svg'>('svg-to-pdf');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
    const [outputSvgList, setOutputSvgList] = useState<string[]>([]);
    const [zipUrl, setZipUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setOutputPdfUrl(null);
        setOutputSvgList([]);
        setZipUrl(null);
        setIsProcessing(true);

        try {
            if (direction === 'svg-to-pdf') {
                const pdfBytes = await convertSvgToPdf(selectedFile);
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                setOutputPdfUrl(URL.createObjectURL(blob));
            } else {
                const svgs = await convertPdfToSvg(selectedFile);
                setOutputSvgList(svgs);

                // Package into ZIP
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();
                svgs.forEach((svg, idx) => {
                    zip.file(`Page_${idx + 1}.svg`, svg);
                });
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                setZipUrl(URL.createObjectURL(zipBlob));
            }
        } catch (err) {
            console.error("Conversion failed", err);
            alert(`Error during ${direction === 'svg-to-pdf' ? 'SVG to PDF' : 'PDF to SVG'} conversion.`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-xs font-medium mb-1">
                    <Shapes className="h-3.5 w-3.5" />
                    Vector Graphics Engine
                </div>
                <h1 className="text-3xl font-bold tracking-tight">SVG to PDF / PDF to SVG</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Lossless bidirectional vector converter between SVG graphics and PDF vector shapes.
                </p>
            </div>

            {/* Direction Selector */}
            <div className="flex justify-center">
                <div className="inline-flex p-1 rounded-xl bg-secondary border border-border/60">
                    <button
                        onClick={() => { setDirection('svg-to-pdf'); setFile(null); setOutputPdfUrl(null); }}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                            direction === 'svg-to-pdf' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        SVG to PDF
                    </button>
                    <button
                        onClick={() => { setDirection('pdf-to-svg'); setFile(null); setOutputSvgList([]); }}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                            direction === 'pdf-to-svg' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        PDF to SVG
                    </button>
                </div>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        accept={direction === 'svg-to-pdf' ? { 'image/svg+xml': ['.svg'] } : { 'application/pdf': ['.pdf'] }}
                        title={direction === 'svg-to-pdf' ? "Drop your vector SVG file here" : "Drop your PDF here to extract vector SVGs"}
                        subtitle={direction === 'svg-to-pdf' ? "Converts SVG vector shapes directly into PDF" : "Extracts each page as a scalable vector .svg graphic"}
                    />
                </div>
            ) : isProcessing ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
                    <p className="text-sm font-medium text-foreground">Processing vector graphics...</p>
                    <p className="text-xs text-muted-foreground">Rendering vector paths and dimensions</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* SVG to PDF Success */}
                    {direction === 'svg-to-pdf' && outputPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Vector PDF Generated!</h3>
                                    <p className="text-xs text-muted-foreground">{file.name} converted with vector precision.</p>
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
                                        Download PDF
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* PDF to SVG Success */}
                    {direction === 'pdf-to-svg' && outputSvgList.length > 0 && (
                        <div className="space-y-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Extracted {outputSvgList.length} Vector SVG Page{outputSvgList.length === 1 ? '' : 's'}!
                                        </h3>
                                        <p className="text-xs text-muted-foreground">Every page rendered as true scalable SVG vector curves.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setFile(null); setOutputSvgList([]); setZipUrl(null); }}
                                    >
                                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                        Choose New PDF
                                    </Button>
                                    {zipUrl && (
                                        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                            <a href={zipUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_svgs.zip`}>
                                                <FileArchive className="h-4 w-4 mr-1.5" />
                                                Download All (ZIP)
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* SVGs Preview Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {outputSvgList.map((svgStr, idx) => (
                                    <div key={idx} className="bg-card border border-border/80 rounded-xl p-3 flex flex-col items-center space-y-2">
                                        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Page {idx + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-[10px]"
                                                onClick={() => {
                                                    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `Page_${idx + 1}.svg`;
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Download SVG
                                            </Button>
                                        </div>
                                        <div 
                                            className="w-full aspect-[3/4] bg-white rounded border border-border/40 overflow-hidden p-2 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                                            dangerouslySetInnerHTML={{ __html: svgStr }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
