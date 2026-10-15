"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resizePdfPages } from "@/lib/pdf-page-utils";
import { 
    Maximize2, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Sparkles, 
    Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_PRESETS = [
    { id: 'a4', name: 'A4', width: 595.28, height: 841.89, desc: '210 x 297 mm (Global Standard)' },
    { id: 'letter', name: 'US Letter', width: 612, height: 792, desc: '8.5 x 11 in (North America)' },
    { id: 'legal', name: 'US Legal', width: 612, height: 1008, desc: '8.5 x 14 in (Contracts & Legal)' },
    { id: 'a3', name: 'A3', width: 841.89, height: 1190.55, desc: '297 x 420 mm (Posters & Blueprints)' },
    { id: 'a5', name: 'A5', width: 419.53, height: 595.28, desc: '148 x 210 mm (Booklets & Notebooks)' },
    { id: 'custom', name: 'Custom Size', width: 600, height: 800, desc: 'User-specified dimensions' },
];

export default function ResizePagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [selectedPreset, setSelectedPreset] = useState('a4');
    const [customWidth, setCustomWidth] = useState(595);
    const [customHeight, setCustomHeight] = useState(842);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [fitMode, setFitMode] = useState<'fit' | 'center' | 'stretch'>('fit');
    const [isResizing, setIsResizing] = useState(false);
    const [resizedPdfUrl, setResizedPdfUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setResizedPdfUrl(null);
    };

    const handleResize = async () => {
        if (!file) return;
        setIsResizing(true);

        try {
            const preset = PAGE_PRESETS.find(p => p.id === selectedPreset);
            let w = selectedPreset === 'custom' ? customWidth : (preset?.width || 595.28);
            let h = selectedPreset === 'custom' ? customHeight : (preset?.height || 841.89);

            if (orientation === 'landscape' && w < h) {
                const temp = w;
                w = h;
                h = temp;
            } else if (orientation === 'portrait' && w > h) {
                const temp = w;
                w = h;
                h = temp;
            }

            const buffer = await file.arrayBuffer();
            const outputBytes = await resizePdfPages(new Uint8Array(buffer), w, h, fitMode);
            const blob = new Blob([outputBytes as any], { type: 'application/pdf' });
            setResizedPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("Failed to resize PDF pages", err);
            alert("Error resizing PDF pages. Please try again.");
        } finally {
            setIsResizing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-1">
                    <Maximize2 className="h-3.5 w-3.5" />
                    Page Utility
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Resize PDF Pages</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Change page dimensions to standard sizes like A4, US Letter, or custom formats with smart auto-centering.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop PDF to resize page dimensions"
                        subtitle="Upload any document to resize to A4, Letter, A3, or custom dimensions"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-card border border-border/80 rounded-xl p-6 space-y-6 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Target Page Dimensions</h3>
                                <p className="text-xs text-muted-foreground">Choose a standard preset or enter custom point values</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setResizedPdfUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                        </div>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PAGE_PRESETS.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPreset(p.id)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all space-y-1",
                                        selectedPreset === p.id
                                            ? "border-violet-500 bg-violet-500/5 ring-2 ring-violet-500/20"
                                            : "border-border/80 hover:border-foreground/30 bg-card"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-xs text-foreground">{p.name}</span>
                                        {selectedPreset === p.id && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Custom Inputs */}
                        {selectedPreset === 'custom' && (
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border/60">
                                <div>
                                    <Label className="text-xs mb-1 block">Width (Points, e.g. 595 for A4)</Label>
                                    <Input
                                        type="number"
                                        value={customWidth}
                                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Height (Points, e.g. 842 for A4)</Label>
                                    <Input
                                        type="number"
                                        value={customHeight}
                                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Orientation & Scaling Behavior */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <Label className="text-xs mb-2 block font-medium">Orientation</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={orientation === 'portrait' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setOrientation('portrait')}
                                        className="text-xs"
                                    >
                                        Portrait
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={orientation === 'landscape' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setOrientation('landscape')}
                                        className="text-xs"
                                    >
                                        Landscape
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs mb-2 block font-medium">Scaling & Fit</Label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <Button
                                        type="button"
                                        variant={fitMode === 'fit' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFitMode('fit')}
                                        className="text-[11px] px-2"
                                    >
                                        Fit (Proportional)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={fitMode === 'center' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFitMode('center')}
                                        className="text-[11px] px-2"
                                    >
                                        Center Original
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={fitMode === 'stretch' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFitMode('stretch')}
                                        className="text-[11px] px-2"
                                    >
                                        Stretch
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleResize}
                            disabled={isResizing}
                            className="w-full h-11 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            {isResizing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Resizing Document Pages...
                                </>
                            ) : (
                                <>
                                    <Maximize2 className="h-4 w-4 mr-2" />
                                    Resize All Pages
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Download Banner */}
                    {resizedPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Resized PDF Ready!</p>
                                    <p className="text-xs text-muted-foreground">
                                        All pages adjusted to {PAGE_PRESETS.find(p => p.id === selectedPreset)?.name || 'custom size'}.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={resizedPdfUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_resized.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Resized PDF
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
