"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import * as XLSX from "xlsx";
import { 
    ReceiptText, 
    FileSpreadsheet, 
    Download, 
    Loader2, 
    Sparkles, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Building2, 
    Calendar 
} from "lucide-react";

interface LineItem {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: string;
    total: number;
}

interface InvoiceData {
    vendor: {
        name: string;
        address?: string;
        email?: string;
        taxId?: string;
    };
    customer?: {
        name: string;
        address?: string;
    };
    invoiceDetails: {
        invoiceNumber: string;
        invoiceDate: string;
        dueDate?: string;
        currency: string;
    };
    lineItems: LineItem[];
    totals: {
        subtotal: number;
        taxAmount: number;
        discount?: number;
        shipping?: number;
        grandTotal: number;
    };
}

export default function InvoiceExtractorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setInvoiceData(null);
    };

    const handleExtract = async () => {
        if (!file) return;
        setIsExtracting(true);

        try {
            const text = await extractTextFromPDF(file);
            const res = await fetch("/api/ai/extract-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to extract invoice data");
            }

            const data: InvoiceData = await res.json();
            setInvoiceData(data);
        } catch (err: any) {
            console.error("Invoice extraction failed:", err);
            alert("Failed to parse invoice: " + (err?.message || "Unknown error"));
        } finally {
            setIsExtracting(false);
        }
    };

    const updateLineItem = (id: number, key: keyof LineItem, val: any) => {
        if (!invoiceData) return;
        const updated = invoiceData.lineItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [key]: val };
                if (key === 'quantity' || key === 'unitPrice') {
                    const q = key === 'quantity' ? Number(val) : item.quantity;
                    const p = key === 'unitPrice' ? Number(val) : item.unitPrice;
                    updatedItem.total = parseFloat((q * p).toFixed(2));
                }
                return updatedItem;
            }
            return item;
        });

        // Recalculate totals
        const newSubtotal = updated.reduce((acc, it) => acc + (it.total || 0), 0);
        const taxRate = 0.1;
        const newTax = parseFloat((newSubtotal * taxRate).toFixed(2));

        setInvoiceData({
            ...invoiceData,
            lineItems: updated,
            totals: {
                ...invoiceData.totals,
                subtotal: newSubtotal,
                taxAmount: newTax,
                grandTotal: newSubtotal + newTax,
            }
        });
    };

    const deleteLineItem = (id: number) => {
        if (!invoiceData) return;
        const filtered = invoiceData.lineItems.filter(item => item.id !== id);
        const newSubtotal = filtered.reduce((acc, it) => acc + (it.total || 0), 0);
        setInvoiceData({
            ...invoiceData,
            lineItems: filtered,
            totals: {
                ...invoiceData.totals,
                subtotal: newSubtotal,
                grandTotal: newSubtotal + (invoiceData.totals.taxAmount || 0),
            }
        });
    };

    const exportToExcel = () => {
        if (!invoiceData) return;
        const rows: (string | number)[][] = [
            ["INVOICE EXTRACTION REPORT"],
            [],
            ["Vendor Name", invoiceData.vendor.name || "N/A"],
            ["Invoice Number", invoiceData.invoiceDetails.invoiceNumber || "N/A"],
            ["Invoice Date", invoiceData.invoiceDetails.invoiceDate || "N/A"],
            ["Currency", invoiceData.invoiceDetails.currency || "USD"],
            [],
            ["Description", "Quantity", "Unit Price", "Line Total"],
        ];

        invoiceData.lineItems.forEach(it => {
            rows.push([it.description, it.quantity, it.unitPrice, it.total]);
        });

        rows.push([]);
        rows.push(["Subtotal", "", "", invoiceData.totals.subtotal]);
        rows.push(["Tax Amount", "", "", invoiceData.totals.taxAmount]);
        rows.push(["Grand Total", "", "", invoiceData.totals.grandTotal]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Invoice Data");

        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${invoiceData.invoiceDetails.invoiceNumber || 'invoice'}_data.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <ReceiptText className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        AI Invoice &amp; Table Extractor
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Batch-scan PDF invoices, receipts, and bank statements to extract line items directly into structured Excel (.xlsx) and CSV.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop invoice or receipt PDF here"
                    subtitle="Extracts vendor details, itemized table rows, taxes, and totals"
                />
            ) : (
                <div className="space-y-6">
                    {/* File Card & Extract Button */}
                    <div className="p-5 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <ReceiptText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • Ready for extraction
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-muted-foreground"
                                onClick={() => {
                                    setFile(null);
                                    setInvoiceData(null);
                                }}
                            >
                                Change File
                            </Button>

                            <Button
                                onClick={handleExtract}
                                disabled={isExtracting}
                                className="h-9 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isExtracting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Extracting Structured Line Items...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Scan &amp; Extract Data</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Results Table & Export */}
                    {invoiceData && (
                        <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-6 shadow-xs">
                            {/* Metadata Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-emerald-500" />
                                        <h2 className="text-base font-bold text-foreground">
                                            {invoiceData.vendor.name || "Vendor Name"}
                                        </h2>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Invoice #{invoiceData.invoiceDetails.invoiceNumber || "N/A"} • Date: {invoiceData.invoiceDetails.invoiceDate || "N/A"}
                                    </p>
                                </div>

                                <Button
                                    onClick={exportToExcel}
                                    className="h-9 px-4 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span>Export to Excel (.xlsx)</span>
                                </Button>
                            </div>

                            {/* Editable Line Items Table */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-foreground">
                                    Extracted Line Items (Click to edit cells):
                                </span>

                                <div className="border border-border/70 rounded-xl overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-secondary/40 text-muted-foreground border-b border-border/60">
                                            <tr>
                                                <th className="py-2.5 px-3 font-semibold">Description</th>
                                                <th className="py-2.5 px-3 font-semibold w-20 text-center">Qty</th>
                                                <th className="py-2.5 px-3 font-semibold w-28 text-right">Price</th>
                                                <th className="py-2.5 px-3 font-semibold w-28 text-right">Total</th>
                                                <th className="py-2.5 px-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {invoiceData.lineItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-secondary/20">
                                                    <td className="py-2 px-3">
                                                        <input
                                                            value={item.description}
                                                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-foreground text-xs"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                                                            className="w-16 bg-transparent border border-border/50 rounded px-1 text-center text-xs"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-right">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                                                            className="w-20 bg-transparent border border-border/50 rounded px-1 text-right text-xs"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                                                        ${item.total?.toFixed(2)}
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteLineItem(item.id)}
                                                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals Summary */}
                            <div className="flex justify-end pt-2">
                                <div className="w-full sm:w-64 space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60 text-xs">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal:</span>
                                        <span className="font-mono text-foreground">${invoiceData.totals.subtotal?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Estimated Tax:</span>
                                        <span className="font-mono text-foreground">${invoiceData.totals.taxAmount?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/50 pt-1.5">
                                        <span>Grand Total:</span>
                                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                            ${invoiceData.totals.grandTotal?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
