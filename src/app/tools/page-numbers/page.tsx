"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { addPageNumbers, PageNumberOptions } from "@/lib/pdf-page-utils";
import { 
    Hash, 
    Download, 
    CheckCircle2, 
    Loader2, 
    Sparkles, 
    AlignLeft, 
    AlignCenter, 
    AlignRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PageNumbersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [position, setPosition] = useState<PageNumberOptions['position']>('bottom-center');
    const [format, setFormat] = useState<PageNumberOptions['format']>('Page {n} of {total}');
    const [skipFirstPage, setSkipFirstPage] = useState(false);
    const [fontSize, setFontSize] = useState(10);
    const [colorHex, setColorHex] = useState('#444444');
    const [fontFamily, setFontFamily] = useState<'Helvetica' | 'Times' | 'Courier'>('Helvetica');

    const [isProcessing, setIsProcessing] = useState(false);
    const [numberedPdfUrl, setNumberedPdfUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setNumberedPdfUrl(null);
    };

    const handleAddNumbers = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const buffer = await file.arrayBuffer();
            const resultBytes = await addPageNumbers(new Uint8Array(buffer), {
                position,
                format,
                fontSize,
                colorHex,
                fontFamily,
                startPage: skipFirstPage ? 2 : 1,
            });

            const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setNumberedPdfUrl(url);
        } catch (err) {
            console.error("Page numbers failed:", err);
            alert("Failed to add page numbers to PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                        <Hash className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Add Page Numbers to PDF
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Number your document pages cleanly with custom positions, styling, and numbering formats.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop PDF to add page numbers"
                    subtitle="Customize numbering format, font size, and positions"
                />
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                <Hash className="h-4 w-4" />
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
                                setNumberedPdfUrl(null);
                            }}
                        >
                            Change Document
                        </Button>
                    </div>

                    {!numberedPdfUrl ? (
                        <div className="space-y-4">
                            {/* Position Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">
                                    Number Placement Position
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'bottom-left', label: 'Bottom Left' },
                                        { id: 'bottom-center', label: 'Bottom Center' },
                                        { id: 'bottom-right', label: 'Bottom Right' },
                                        { id: 'top-left', label: 'Top Left' },
                                        { id: 'top-center', label: 'Top Center' },
                                        { id: 'top-right', label: 'Top Right' },
                                    ].map((pos) => (
                                        <button
                                            key={pos.id}
                                            type="button"
                                            onClick={() => setPosition(pos.id as any)}
                                            className={cn(
                                                "p-2 text-xs rounded-lg border transition-all text-center cursor-pointer font-medium",
                                                position === pos.id
                                                    ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                                    : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                            )}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">
                                    Numbering Format
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        'Page {n} of {total}',
                                        '{n} / {total}',
                                        '{n}',
                                        '- {n} -',
                                    ].map((fmt) => (
                                        <button
                                            key={fmt}
                                            type="button"
                                            onClick={() => setFormat(fmt as any)}
                                            className={cn(
                                                "p-2 text-xs rounded-lg border transition-all text-center cursor-pointer font-medium font-mono",
                                                format === fmt
                                                    ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                                                    : "bg-secondary/40 text-muted-foreground border-border/70 hover:bg-secondary"
                                            )}
                                        >
                                            {fmt.replace('{n}', '1').replace('{total}', '10')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font and Skip Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Font Style &amp; Size
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={fontFamily}
                                            onChange={(e) => setFontFamily(e.target.value as any)}
                                            className="h-9 px-2 text-xs rounded-lg border border-border/70 bg-card text-foreground flex-1 cursor-pointer"
                                        >
                                            <option value="Helvetica">Helvetica (Clean)</option>
                                            <option value="Times">Times Roman (Formal)</option>
                                            <option value="Courier">Courier (Monospace)</option>
                                        </select>
                                        <Input
                                            type="number"
                                            min={8}
                                            max={20}
                                            value={fontSize}
                                            onChange={(e) => setFontSize(Number(e.target.value))}
                                            className="h-9 w-16 text-xs text-center"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 flex flex-col justify-end">
                                    <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-secondary/20 cursor-pointer text-xs">
                                        <input
                                            type="checkbox"
                                            checked={skipFirstPage}
                                            onChange={(e) => setSkipFirstPage(e.target.checked)}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Skip first page (Cover Page)</span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleAddNumbers}
                                disabled={isProcessing}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Stamping Page Numbers...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Apply Page Numbers &amp; Download</span>
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
                                    Page Numbers Added!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Your document now includes clean, uniform page numbering.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <a
                                    href={numberedPdfUrl}
                                    download={`${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`}
                                >
                                    <Button className="h-9 px-5 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Download Numbered PDF</span>
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
