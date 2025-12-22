"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowDown, Download, Image as ImageIcon } from "lucide-react";
import { convertImagesToPdf } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { useGlobalToolContext } from "@/context/GlobalToolContext";
import { ImageGrid } from "@/components/tools/ImageGrid";

export default function ImageToPdfPage() {
    const { imageToPdf, setImageToPdf } = useGlobalToolContext();
    const { files, isConverting, pdfUrl } = imageToPdf;

    const onDrop = (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.filter(f => f.type.startsWith("image/"));
        setImageToPdf({
            files: [...files, ...newFiles],
            pdfUrl: null
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"]
        },
    });

    const setFiles = (newFiles: File[]) => {
        setImageToPdf({
            files: newFiles,
            pdfUrl: null
        });
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setImageToPdf({ isConverting: true });

        try {
            const pdfBytes = await convertImagesToPdf(files);
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setImageToPdf({ pdfUrl: url });
        } catch (error) {
            console.error("Conversion failed:", error);
            alert("Failed to convert images. Please try again.");
        } finally {
            setImageToPdf({ isConverting: false });
        }
    };

    return (
        <div className="container max-w-6xl py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Images to PDF</h1>
                <p className="text-muted-foreground">
                    Convert your images to a single PDF document. Drag and drop to reorder.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Upload & Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors min-h-[200px] flex flex-col items-center justify-center",
                            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:bg-muted/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <ArrowDown className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="font-medium">Drop Images here</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG, WebP</p>
                    </div>

                    <Button
                        onClick={handleConvert}
                        disabled={files.length === 0 || isConverting}
                        className="w-full"
                        size="lg"
                    >
                        {isConverting ? "Converting..." : "Convert to PDF"}
                    </Button>

                    {/* Result */}
                    {pdfUrl && (
                        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-green-900 dark:text-green-100">Ready!</h3>
                                </div>
                            </div>
                            <a href={pdfUrl} download="images.pdf" className="block w-full">
                                <Button className="w-full gap-2" variant="outline">
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            </a>
                        </div>
                    )}
                </div>

                {/* Right Column: Grid */}
                <Card className="lg:col-span-2 h-full min-h-[500px]">
                    <CardContent className="p-0 h-full flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Selected Images ({files.length})
                            </h3>
                        </div>

                        {files.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                                <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                                <p>No images selected yet.</p>
                                <p className="text-sm">Upload images to get started.</p>
                            </div>
                        ) : (
                            <div className="flex-1 p-2 bg-muted/20">
                                <ImageGrid files={files} setFiles={setFiles} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
