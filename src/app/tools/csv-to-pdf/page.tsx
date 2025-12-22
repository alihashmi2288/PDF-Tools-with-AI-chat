"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CsvToPdfPage() {
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
            
            Papa.parse(text, {
                complete: (results) => {
                    const data = results.data as any[][];
                    
                    if (data.length === 0) {
                        alert("CSV file is empty");
                        setConverting(false);
                        return;
                    }

                    const pdf = new jsPDF("p", "mm", "a4");
                    
                    (pdf as any).autoTable({
                        head: [data[0]],
                        body: data.slice(1),
                        startY: 20,
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [41, 128, 185] }
                    });

                    pdf.save(file.name.replace(/\.csv$/i, ".pdf"));
                    setConverting(false);
                },
                error: (error) => {
                    console.error("Parse error:", error);
                    alert("Failed to parse CSV file");
                    setConverting(false);
                }
            });
        } catch (error) {
            console.error("Conversion error:", error);
            alert("Failed to convert CSV to PDF");
            setConverting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">CSV to PDF Converter</h1>
            
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label htmlFor="csv-upload">
                            <Button variant="outline" asChild>
                                <span>Select CSV File</span>
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
