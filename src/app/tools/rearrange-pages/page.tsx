"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { reorderPdfPages } from "@/lib/pdf-page-utils";
import { 
    ArrowUpDown, 
    Download, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    GripVertical, 
    RotateCcw,
    Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePageItem {
    id: string;
    originalIndex: number; // 0-indexed
    dataUrl: string;
}

function SortablePageCard({ 
    item, 
    currentIndex 
}: { 
    item: SortablePageItem; 
    currentIndex: number;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isMoved = item.originalIndex !== currentIndex;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "relative group border rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-shadow p-2 flex flex-col items-center bg-card select-none",
                isDragging ? "shadow-2xl ring-2 ring-primary z-50 opacity-90 scale-105" : "hover:shadow-md border-border/80 hover:border-foreground/30",
                isMoved && "border-primary/50 bg-primary/5"
            )}
        >
            <div className="w-full flex items-center justify-between pb-1.5 px-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span>Pos {currentIndex + 1}</span>
                </div>
                <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono",
                    isMoved ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-muted-foreground"
                )}>
                    {isMoved ? `Orig P.${item.originalIndex + 1}` : `P.${item.originalIndex + 1}`}
                </span>
            </div>

            <div className="relative w-full aspect-[3/4] bg-white rounded border border-border/40 overflow-hidden flex items-center justify-center">
                <img
                    src={item.dataUrl}
                    alt={`Page ${item.originalIndex + 1}`}
                    className="w-full h-full object-contain pointer-events-none"
                />
            </div>
        </div>
    );
}

export default function RearrangePagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<SortablePageItem[]>([]);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [reorderedPdfUrl, setReorderedPdfUrl] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setReorderedPdfUrl(null);
        setIsLoadingPreviews(true);

        try {
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: buffer }).promise;
            const items: SortablePageItem[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    items.push({
                        id: `page-${i}`,
                        originalIndex: i - 1,
                        dataUrl: canvas.toDataURL('image/png'),
                    });
                }
            }
            setPages(items);
        } catch (e) {
            console.error("Failed to render page thumbnails", e);
        } finally {
            setIsLoadingPreviews(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const reverseOrder = () => {
        setPages((items) => [...items].reverse());
    };

    const resetOrder = () => {
        setPages((items) => [...items].sort((a, b) => a.originalIndex - b.originalIndex));
    };

    const moveFirstToEnd = () => {
        if (pages.length < 2) return;
        setPages((items) => [...items.slice(1), items[0]]);
    };

    const handleSave = async () => {
        if (!file || pages.length === 0) return;
        setIsSaving(true);

        try {
            const newOrderIndices = pages.map((p) => p.originalIndex);
            const buffer = await file.arrayBuffer();
            const outputBytes = await reorderPdfPages(new Uint8Array(buffer), newOrderIndices);

            const blob = new Blob([outputBytes as any], { type: "application/pdf" });
            setReorderedPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error("Failed to reorder PDF pages", err);
            alert("Error reordering pages. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanged = pages.some((p, idx) => p.originalIndex !== idx);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium mb-1">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Page Utility
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Rearrange & Reorder Pages</h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Drag and drop page cards to reorder them in any sequence.
                </p>
            </div>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop your PDF here to reorder pages"
                        subtitle="Upload document to start visual drag-and-drop reordering"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Control Bar */}
                    <div className="bg-card border border-border/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setFile(null); setPages([]); setReorderedPdfUrl(null); }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Choose New File
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Total: <strong>{pages.length}</strong> pages
                            </span>
                            {hasChanged && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                    Sequence Modified
                                </span>
                            )}
                        </div>

                        {/* Presets and Save */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={reverseOrder} className="text-xs h-8">
                                Reverse Order
                            </Button>
                            <Button variant="ghost" size="sm" onClick={moveFirstToEnd} className="text-xs h-8">
                                First to Last
                            </Button>
                            <Button variant="ghost" size="sm" onClick={resetOrder} className="text-xs h-8 text-muted-foreground">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                        Reorganizing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-1.5" />
                                        Save Reordered PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Download Banner */}
                    {reorderedPdfUrl && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Reordered PDF Ready!</p>
                                    <p className="text-xs text-muted-foreground">
                                        All {pages.length} pages arranged in your custom order.
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={reorderedPdfUrl} download={`${file.name.replace(/\.[^/.]+$/, '')}_reordered.pdf`}>
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Download Reordered PDF
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* Drag and Drop Grid */}
                    {isLoadingPreviews ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading page thumbnails...</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={pages} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {pages.map((item, index) => (
                                        <SortablePageCard
                                            key={item.id}
                                            item={item}
                                            currentIndex={index}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            )}
        </div>
    );
}
