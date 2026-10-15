"use client";

import { useState, useRef, useEffect } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signPdfDocument, SignatureFieldItem } from "@/lib/pdf-signature-utils";
import { 
    PenTool, 
    Type, 
    Upload, 
    Calendar, 
    Check, 
    Download, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    Sparkles, 
    CheckCircle2, 
    ShieldCheck, 
    Plus,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [pageImageDataUrl, setPageImageDataUrl] = useState<string | null>(null);
    const [isLoadingPage, setIsLoadingPage] = useState(false);

    // Signature creation mode
    const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
    const [inkColor, setInkColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2.5);
    const [typedName, setTypedName] = useState("Alex Johnson");
    const [typedFont, setTypedFont] = useState("'Caveat', cursive");
    const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);

    // Active signature stamp for placement
    const [signatureStampUrl, setSignatureStampUrl] = useState<string | null>(null);
    
    // Placed items on the PDF
    const [placedItems, setPlacedItems] = useState<SignatureFieldItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Canvas drawing ref
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    // Output signed PDF
    const [isSigning, setIsSigning] = useState(false);
    const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);

    // Initialize draw canvas
    useEffect(() => {
        if (activeTab === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = inkColor;
                ctx.lineWidth = strokeWidth;
            }
        }
    }, [activeTab, inkColor, strokeWidth]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        lastPosRef.current = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        lastPosRef.current = { x: currentX, y: currentY };
    };

    const stopDrawing = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        if (canvasRef.current) {
            setSignatureStampUrl(canvasRef.current.toDataURL('image/png'));
        }
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            setSignatureStampUrl(null);
        }
    };

    // Load PDF page image for preview
    const renderPdfPagePreview = async (fileObj: File, pageIdx: number) => {
        setIsLoadingPage(true);
        try {
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await fileObj.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: buffer }).promise;
            setPageCount(pdf.numPages);

            const page = await pdf.getPage(pageIdx + 1);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport }).promise;
                setPageImageDataUrl(canvas.toDataURL('image/png'));
            }
        } catch (e) {
            console.error("Failed to render PDF page for signature preview", e);
        } finally {
            setIsLoadingPage(false);
        }
    };

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setCurrentPageIndex(0);
        setPlacedItems([]);
        setSignedPdfUrl(null);
        await renderPdfPagePreview(selectedFile, 0);
    };

    const changePage = async (offset: number) => {
        if (!file) return;
        const newPage = Math.max(0, Math.min(pageCount - 1, currentPageIndex + offset));
        setCurrentPageIndex(newPage);
        await renderPdfPagePreview(file, newPage);
    };

    // Generate stamp from typed name
    const generateTypedStamp = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = 400;
        offscreen.height = 120;
        const ctx = offscreen.getContext('2d');
        if (ctx) {
            ctx.font = `48px ${typedFont}`;
            ctx.fillStyle = inkColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(typedName, 200, 60);
            return offscreen.toDataURL('image/png');
        }
        return null;
    };

    // Handle Upload image with white background removal
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const offscreen = document.createElement('canvas');
                offscreen.width = img.width;
                offscreen.height = img.height;
                const ctx = offscreen.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
                    const data = imgData.data;
                    // Make near-white pixels transparent
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        if (r > 220 && g > 220 && b > 220) {
                            data[i + 3] = 0; // alpha
                        }
                    }
                    ctx.putImageData(imgData, 0, 0);
                    const transUrl = offscreen.toDataURL('image/png');
                    setUploadedImgUrl(transUrl);
                    setSignatureStampUrl(transUrl);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(files[0]);
    };

    // Place an element on the active page
    const placeElement = (type: 'signature-image' | 'date-stamp' | 'typed-text' | 'checkmark') => {
        const id = 'sig_' + Math.random().toString(36).substring(2, 9);
        let stampUrl = signatureStampUrl;

        if (activeTab === 'type' && type === 'signature-image') {
            stampUrl = generateTypedStamp();
        } else if (activeTab === 'upload' && type === 'signature-image') {
            stampUrl = uploadedImgUrl;
        }

        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const newItem: SignatureFieldItem = {
            id,
            type,
            pageIndex: currentPageIndex,
            xPercent: 35,
            yPercent: 45,
            widthPercent: type === 'checkmark' ? 6 : type === 'signature-image' ? 26 : 22,
            heightPercent: type === 'checkmark' ? 5 : type === 'signature-image' ? 8 : 4,
            imageDataUrl: stampUrl || undefined,
            textContent: type === 'date-stamp' ? today : type === 'typed-text' ? typedName : undefined,
            textColorHex: inkColor,
        };

        setPlacedItems([...placedItems, newItem]);
        setSelectedItemId(id);
    };

    const deletePlacedItem = (id: string) => {
        setPlacedItems(placedItems.filter(item => item.id !== id));
        if (selectedItemId === id) setSelectedItemId(null);
    };

    // Execute PDF signing
    const handleSignAndSave = async () => {
        if (!file || placedItems.length === 0) {
            alert("Please place at least one signature or date field before saving.");
            return;
        }

        setIsSigning(true);
        try {
            const buffer = await file.arrayBuffer();
            const signedBytes = await signPdfDocument(new Uint8Array(buffer), placedItems);

            const blob = new Blob([signedBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setSignedPdfUrl(url);
        } catch (error) {
            console.error("Signing failed:", error);
            alert("Failed to stamp signature onto PDF.");
        } finally {
            setIsSigning(false);
        }
    };

    const currentPageItems = placedItems.filter(item => item.pageIndex === currentPageIndex);

    return (
        <div className="max-w-5xl mx-auto py-4 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <PenTool className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        e-Sign PDF Document
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Draw, type, or upload transparent signatures, place date &amp; initials fields, and download a signed PDF directly from your browser.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop PDF to sign"
                    subtitle="100% private • Your document and signature never touch an external server"
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Signature Creation Tools (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="p-4 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                                <span className="text-xs font-semibold text-foreground">
                                    Create Your Signature
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {['#000000', '#1e3a8a', '#dc2626'].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setInkColor(color)}
                                            className={cn(
                                                "h-4 w-4 rounded-full border transition-transform cursor-pointer",
                                                inkColor === color ? "scale-125 border-foreground" : "border-border/60"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Tabs: Draw / Type / Upload */}
                            <div className="grid grid-cols-3 gap-1 bg-secondary/40 p-1 rounded-lg border border-border/50">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('draw')}
                                    className={cn(
                                        "py-1 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer",
                                        activeTab === 'draw' ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground"
                                    )}
                                >
                                    <PenTool className="h-3 w-3" />
                                    <span>Draw</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('type')}
                                    className={cn(
                                        "py-1 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer",
                                        activeTab === 'type' ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground"
                                    )}
                                >
                                    <Type className="h-3 w-3" />
                                    <span>Type</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('upload')}
                                    className={cn(
                                        "py-1 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer",
                                        activeTab === 'upload' ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground"
                                    )}
                                >
                                    <Upload className="h-3 w-3" />
                                    <span>Upload</span>
                                </button>
                            </div>

                            {/* Tab 1: Draw Canvas */}
                            {activeTab === 'draw' && (
                                <div className="space-y-2">
                                    <div className="relative border-2 border-dashed border-border/80 rounded-lg bg-background overflow-hidden">
                                        <canvas
                                            ref={canvasRef}
                                            width={320}
                                            height={130}
                                            className="w-full h-[130px] touch-none cursor-crosshair bg-white"
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                        />
                                        <div className="absolute bottom-1 right-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                                                onClick={clearCanvas}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center">
                                        Draw your signature above with mouse or touch
                                    </p>
                                </div>
                            )}

                            {/* Tab 2: Type Signature */}
                            {activeTab === 'type' && (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Signer Name</Label>
                                        <Input
                                            value={typedName}
                                            onChange={(e) => setTypedName(e.target.value)}
                                            className="h-8 text-xs font-medium"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="p-3 rounded-lg border border-border/60 bg-white text-center min-h-[70px] flex items-center justify-center">
                                        <span 
                                            className="text-2xl" 
                                            style={{ fontFamily: typedFont, color: inkColor }}
                                        >
                                            {typedName || "Alex Johnson"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Upload Image */}
                            {activeTab === 'upload' && (
                                <div className="space-y-2">
                                    <div className="border border-dashed border-border/80 rounded-lg p-4 text-center bg-secondary/10">
                                        <input
                                            type="file"
                                            id="sig-upload"
                                            accept="image/png, image/jpeg"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <label
                                            htmlFor="sig-upload"
                                            className="cursor-pointer flex flex-col items-center gap-1.5"
                                        >
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-xs font-semibold text-foreground underline">
                                                Select Signature Photo
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                White backgrounds removed automatically
                                            </span>
                                        </label>
                                    </div>

                                    {uploadedImgUrl && (
                                        <div className="p-2 border rounded-md bg-white text-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={uploadedImgUrl}
                                                alt="Uploaded signature"
                                                className="max-h-16 mx-auto object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons to Place Items */}
                            <div className="space-y-2 pt-2 border-t border-border/40">
                                <span className="text-[11px] font-semibold text-muted-foreground">
                                    Stamp Fields Onto Page {currentPageIndex + 1}:
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => placeElement('signature-image')}
                                        className="h-8 text-xs font-medium gap-1.5 justify-start cursor-pointer"
                                    >
                                        <PenTool className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>+ Signature</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => placeElement('date-stamp')}
                                        className="h-8 text-xs font-medium gap-1.5 justify-start cursor-pointer"
                                    >
                                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                        <span>+ Today&apos;s Date</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => placeElement('typed-text')}
                                        className="h-8 text-xs font-medium gap-1.5 justify-start cursor-pointer"
                                    >
                                        <Type className="h-3.5 w-3.5 text-purple-500" />
                                        <span>+ Print Name</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => placeElement('checkmark')}
                                        className="h-8 text-xs font-medium gap-1.5 justify-start cursor-pointer"
                                    >
                                        <Check className="h-3.5 w-3.5 text-amber-500" />
                                        <span>+ Checkmark</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Placed Items List & Burn CTA */}
                        <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">
                                    Placed Stamps ({placedItems.length})
                                </span>
                                {placedItems.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setPlacedItems([])}
                                        className="text-[10px] text-destructive hover:underline cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {placedItems.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                    No fields placed yet. Click a field above to place it on this page.
                                </p>
                            ) : (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {placedItems.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedItemId(item.id)}
                                            className={cn(
                                                "p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all",
                                                selectedItemId === item.id
                                                    ? "border-emerald-500 bg-emerald-500/10 font-semibold"
                                                    : "border-border/60 bg-secondary/20 hover:bg-secondary/40"
                                            )}
                                        >
                                            <span className="truncate max-w-[180px]">
                                                {idx + 1}. {item.type.replace('-', ' ')} (P.{item.pageIndex + 1})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePlacedItem(item.id);
                                                }}
                                                className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button
                                onClick={handleSignAndSave}
                                disabled={isSigning || placedItems.length === 0}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isSigning ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Embedding Signatures...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Apply Signatures &amp; Download</span>
                                    </>
                                )}
                            </Button>

                            {signedPdfUrl && (
                                <div className="pt-2 text-center">
                                    <a
                                        href={signedPdfUrl}
                                        download={`${file.name.replace(/\.pdf$/i, '')}_signed.pdf`}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download Signed PDF Now
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Visual PDF Interactive Placement Canvas (8 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3 shadow-xs">
                            {/* Page Navigator */}
                            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={currentPageIndex <= 0}
                                        onClick={() => changePage(-1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-mono font-medium text-foreground">
                                        Page {currentPageIndex + 1} of {pageCount}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={currentPageIndex >= pageCount - 1}
                                        onClick={() => changePage(1)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <span className="text-[11px] text-muted-foreground">
                                    Drag fields below to position them precisely
                                </span>
                            </div>

                            {/* PDF Page Interactive Preview Box */}
                            <div className="relative border border-border/60 rounded-xl bg-secondary/30 min-h-[500px] flex items-center justify-center overflow-hidden p-3 select-none">
                                {isLoadingPage ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                        <span>Rendering page view...</span>
                                    </div>
                                ) : pageImageDataUrl ? (
                                    <div className="relative shadow-md border border-border/50 max-w-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={pageImageDataUrl}
                                            alt={`PDF Page ${currentPageIndex + 1}`}
                                            className="max-h-[680px] w-auto object-contain block pointer-events-none"
                                        />

                                        {/* Interactive Overlaid Fields */}
                                        {currentPageItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedItemId(item.id)}
                                                style={{
                                                    left: `${item.xPercent}%`,
                                                    top: `${item.yPercent}%`,
                                                    width: `${item.widthPercent}%`,
                                                    height: `${item.heightPercent}%`,
                                                }}
                                                className={cn(
                                                    "absolute rounded border cursor-move flex items-center justify-center p-1 transition-shadow",
                                                    selectedItemId === item.id
                                                        ? "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/40 z-20"
                                                        : "border-border/80 bg-background/80 hover:border-emerald-400 z-10"
                                                )}
                                                onMouseDown={(e) => {
                                                    const startX = e.clientX;
                                                    const startY = e.clientY;
                                                    const initX = item.xPercent;
                                                    const initY = item.yPercent;

                                                    const onMouseMove = (moveEvent: MouseEvent) => {
                                                        const deltaX = (moveEvent.clientX - startX) / 5;
                                                        const deltaY = (moveEvent.clientY - startY) / 5;
                                                        setPlacedItems((prev) =>
                                                            prev.map((it) =>
                                                                it.id === item.id
                                                                    ? {
                                                                          ...it,
                                                                          xPercent: Math.max(0, Math.min(85, initX + deltaX)),
                                                                          yPercent: Math.max(0, Math.min(90, initY + deltaY)),
                                                                      }
                                                                    : it
                                                            )
                                                        );
                                                    };

                                                    const onMouseUp = () => {
                                                        window.removeEventListener('mousemove', onMouseMove);
                                                        window.removeEventListener('mouseup', onMouseUp);
                                                    };

                                                    window.addEventListener('mousemove', onMouseMove);
                                                    window.addEventListener('mouseup', onMouseUp);
                                                }}
                                            >
                                                {item.type === 'signature-image' && item.imageDataUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.imageDataUrl}
                                                        alt="Signature"
                                                        className="max-h-full max-w-full object-contain pointer-events-none"
                                                    />
                                                ) : (
                                                    <span className="text-[11px] font-semibold text-foreground truncate pointer-events-none">
                                                        {item.textContent || '✓'}
                                                    </span>
                                                )}

                                                {selectedItemId === item.id && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deletePlacedItem(item.id);
                                                        }}
                                                        className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-[10px] shadow-sm hover:scale-110 cursor-pointer"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Select a file to preview</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
