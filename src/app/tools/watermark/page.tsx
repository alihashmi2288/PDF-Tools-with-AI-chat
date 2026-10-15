"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { addWatermark } from "@/lib/pdf-page-utils";
import { 
    Stamp, 
    Download, 
    CheckCircle2, 
    Loader2, 
    Sparkles, 
    Image as ImageIcon, 
    Type 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WatermarkPage() {
    const [file, setFile] = useState<File | null>(null);
    const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
    
    // Text watermark state
    const [text, setText] = useState("CONFIDENTIAL");
    const [fontSize, setFontSize] = useState(48);
    const [rotationAngle, setRotationAngle] = useState(45);
    const [opacity, setOpacity] = useState(0.25);
    const [colorHex, setColorHex] = useState("#dc2626");
    const [layout, setLayout] = useState<'center' | 'diagonal-grid'>('center');

    // Image watermark state
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setWatermarkedPdfUrl(null);
    };

    const handleApplyWatermark = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const buffer = await file.arrayBuffer();
            let resultBytes: Uint8Array;

            if (watermarkType === 'text') {
                resultBytes = await addWatermark(new Uint8Array(buffer), {
                    type: 'text',
                    text: text || 'CONFIDENTIAL',
                    fontSize,
                    rotationAngle,
                    opacity,
                    colorHex,
                    layout,
                });
            } else {
                if (!imageFile) {
                    alert("Please select a watermark image file first.");
                    setIsProcessing(false);
                    return;
                }
                const imgBuffer = await imageFile.arrayBuffer();
                const imgType = imageFile.type.includes('png') ? 'png' : 'jpeg';
                resultBytes = await addWatermark(new Uint8Array(buffer), {
                    type: 'image',
                    imageBytes: imgBuffer,
                    imageType: imgType,
                    opacity,
                    rotationAngle,
                });
            }

            const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setWatermarkedPdfUrl(url);
        } catch (err) {
            console.error("Watermark error:", err);
            alert("Failed to apply watermark.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                        <Stamp className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Add Watermark to PDF
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Stamp text notices (CONFIDENTIAL, DRAFT) or company logo stamps across all pages with custom opacity and rotation.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop PDF to add watermark"
                    subtitle="Protect intellectual property and brand your documents"
                />
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                                <Stamp className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                                setFile(null);
                                setWatermarkedPdfUrl(null);
                            }}
                        >
                            Change Document
                        </Button>
                    </div>

                    {!watermarkedPdfUrl ? (
                        <div className="space-y-4">
                            {/* Watermark Type Selector */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setWatermarkType('text')}
                                    className={cn(
                                        "p-2.5 text-xs rounded-lg border transition-all text-center cursor-pointer font-medium flex items-center justify-center gap-1.5",
                                        watermarkType === 'text'
                                            ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                            : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                    )}
                                >
                                    <Type className="h-3.5 w-3.5" />
                                    <span>Text Watermark</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWatermarkType('image')}
                                    className={cn(
                                        "p-2.5 text-xs rounded-lg border transition-all text-center cursor-pointer font-medium flex items-center justify-center gap-1.5",
                                        watermarkType === 'image'
                                            ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                            : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                    )}
                                >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    <span>Logo / Image Stamp</span>
                                </button>
                            </div>

                            {watermarkType === 'text' ? (
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">
                                            Watermark Text
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT SHARE"
                                                className="h-9 text-xs"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE'].map((quick) => (
                                                <button
                                                    key={quick}
                                                    type="button"
                                                    onClick={() => setText(quick)}
                                                    className="text-[10px] px-2 py-0.5 rounded bg-secondary/80 border border-border/60 hover:text-foreground text-muted-foreground cursor-pointer"
                                                >
                                                    {quick}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Layout: Centered vs Diagonal Grid */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setLayout('center')}
                                            className={cn(
                                                "p-2 text-xs rounded-lg border text-center cursor-pointer font-medium",
                                                layout === 'center'
                                                    ? "bg-foreground text-background font-semibold border-foreground"
                                                    : "bg-secondary/40 text-muted-foreground border-border/70"
                                            )}
                                        >
                                            Single Centered Stamp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLayout('diagonal-grid')}
                                            className={cn(
                                                "p-2 text-xs rounded-lg border text-center cursor-pointer font-medium",
                                                layout === 'diagonal-grid'
                                                    ? "bg-foreground text-background font-semibold border-foreground"
                                                    : "bg-secondary/40 text-muted-foreground border-border/70"
                                            )}
                                        >
                                            Repeated Tiled Grid
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Select Logo / Watermark Image
                                    </Label>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-foreground hover:file:bg-secondary/80 cursor-pointer"
                                    />
                                    {imageFile && (
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                                            ✓ {imageFile.name} loaded
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Sliders for Opacity and Angle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-foreground">Opacity</span>
                                        <span className="font-mono text-muted-foreground">{Math.round(opacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0.05}
                                        max={0.8}
                                        step={0.05}
                                        value={opacity}
                                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                        className="w-full cursor-pointer accent-rose-600"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-foreground">Rotation Angle</span>
                                        <span className="font-mono text-muted-foreground">{rotationAngle}°</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={-90}
                                        max={90}
                                        step={15}
                                        value={rotationAngle}
                                        onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                                        className="w-full cursor-pointer accent-rose-600"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleApplyWatermark}
                                disabled={isProcessing}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Stamping Watermarks...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Apply Watermark to All Pages</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 text-center">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-sm text-foreground">
                                    Watermark Applied!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Your document has been stamped across all pages.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <a
                                    href={watermarkedPdfUrl}
                                    download={`${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`}
                                >
                                    <Button className="h-9 px-5 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Download Watermarked PDF</span>
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
