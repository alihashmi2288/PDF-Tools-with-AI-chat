"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download, Loader2 } from "lucide-react";
import { marked } from "marked";
import jsPDF from "jspdf";

export default function MarkdownToPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const convertToPdf = async () => {
        if (!file) return;
        setConverting(true);

        try {
            const text = await file.text();
            const html = await marked(text);

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            tempDiv.style.width = "210mm";
            tempDiv.style.padding = "20mm";
            tempDiv.style.fontFamily = "Arial, sans-serif";
            tempDiv.style.fontSize = "12pt";
            tempDiv.style.lineHeight = "1.6";
            document.body.appendChild(tempDiv);

            const pdf = new jsPDF("p", "mm", "a4");
            await pdf.html(tempDiv, {
                callback: (doc) => {
                    doc.save(file.name.replace(/\.md$/i, ".pdf"));
                    document.body.removeChild(tempDiv);
                    setConverting(false);
                },
                x: 10,
                y: 10,
                width: 190,
                windowWidth: 794
            });
        } catch (error) {
            console.error("Conversion error:", error);
            alert("Failed to convert Markdown to PDF");
            setConverting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Markdown to PDF Converter</h1>
            
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <input
                            type="file"
                            accept=".md,.markdown"
                            onChange={handleFileChange}
                            className="hidden"
                            id="md-upload"
                        />
                        <label htmlFor="md-upload">
                            <Button variant="outline" asChild>
                                <span>Select Markdown File</span>
                            </Button>
                        </label>
                        {file && (
                            <p className="mt-4 text-sm text-muted-foreground">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>

                    {file && (
                        <Button 
                            onClick={convertToPdf} 
                            disabled={converting}
                            className="w-full"
                        >
                            {converting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Convert to PDF
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
