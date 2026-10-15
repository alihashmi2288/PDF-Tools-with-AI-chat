"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { convertPdfToGrayscale } from "@/lib/pdf-page-utils";
import { 
    Moon, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Droplet, 
    Sparkles, 
    Sliders 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GrayscalePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'grayscale' | 'monochrome'>('grayscale');
    const [threshold, setThreshold] = useState<number>(128);
    const [isConverting, setIsConverting] = useState(false);
    const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setOutputPdfUrl(null);

        // Render first page preview
        try {
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: buffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.8 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport }).promise;
                setPreviewUrl(canvas.toDataURL('image/png'));
            }
        } catch (e) {
            console.error("Preview render failed", e);
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);

        try {
            const buffer = await file.arrayBuffer();
            const outputBytes = await convertPdfToGrayscale(
                new Uint8Array(buffer),
                mode,
                threshold
            );

            const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
            setOutputPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("Grayscale conversion failed", err);
            alert("Failed to convert PDF to grayscale. Please try again.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-500 text-xs font-medium mb-1">
                    <Moon className="h-3.5 w-3.5" />
                    Ink-Saving Utility
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Grayscale & Black & White PDF</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Remove colors to save expensive printer ink, reduce file size, and optimize documents for black & white printing.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop color PDF to convert to grayscale"
                        subtitle="Converts all photos, charts, and graphics to ink-saving monochrome"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="bg-card border border-border/80 rounded-xl p-6 space-y-6 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Color Mode Options</h3>
                                <p className="text-xs text-muted-foreground">Select how color elements should be converted</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setOutputPdfUrl(null); setPreviewUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                        </div>

                        {/* Mode Selection Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                                onClick={() => setMode('grayscale')}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all space-y-1.5",
                                    mode === 'grayscale'
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                        : "border-border/80 hover:border-foreground/30 bg-card"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">Smooth Grayscale</span>
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                        Recommended
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Preserves photographic shades, gradients, and soft shadows in smooth shades of gray. Ideal for documents with photos.
                                </p>
                            </div>

                            <div
                                onClick={() => setMode('monochrome')}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all space-y-1.5",
                                    mode === 'monochrome'
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                        : "border-border/80 hover:border-foreground/30 bg-card"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">Pure Black & White (Threshold)</span>
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                                        Max Ink Saver
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Converts everything strictly to pure solid black or pure white with no intermediate grays. Perfect for text scans, forms, and faxing.
                                </p>
                            </div>
                        </div>

                        {/* Threshold Slider for Monochrome */}
                        {mode === 'monochrome' && (
                            <div className="space-y-2 p-3 bg-secondary/40 rounded-lg">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground">Black/White Binarization Threshold</span>
                                    <span className="font-mono text-muted-foreground">{threshold} / 255</span>
                                </div>
                                <input
                                    type="range"
                                    min="40"
                                    max="220"
                                    value={threshold}
                                    onChange={(e) => setThreshold(Number(e.target.value))}
                                    className="w-full accent-primary cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Lighter (Thinner text)</span>
                                    <span>Default (128)</span>
                                    <span>Darker (Bolder text)</span>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleConvert}
                            disabled={isConverting}
                            className="w-full h-11 text-sm font-semibold"
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Converting PDF to {mode === 'grayscale' ? 'Grayscale' : 'Pure B&W'}...
                                </>
                            ) : (
                                <>
                                    <Moon className="h-4 w-4 mr-2" />
                                    Convert to {mode === 'grayscale' ? 'Grayscale' : 'Black & White'}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Result Download Banner */}
                    {outputPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Monochrome PDF Ready!</p>
                                    <p className="text-xs text-muted-foreground">
                                        Colors removed cleanly. Ready for printer ink savings.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={outputPdfUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_grayscale.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Grayscale PDF
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Live Preview Sample */}
                    {previewUrl && (
                        <div className="bg-card border border-border/80 rounded-xl p-6 text-center space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Page Preview</h4>
                            <div className="max-w-xs mx-auto border border-border/60 rounded-lg overflow-hidden shadow-sm">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className={cn(
                                        "w-full h-auto transition-all",
                                        mode === 'grayscale' ? "filter grayscale" : "filter contrast-200 grayscale"
                                    )}
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Simulated {mode === 'grayscale' ? 'grayscale' : 'monochrome'} rendering of page 1
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
