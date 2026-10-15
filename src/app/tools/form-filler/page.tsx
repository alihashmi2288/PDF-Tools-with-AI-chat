"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    inspectAcroFormFields, 
    fillAcroForm, 
    createSampleAcroForm, 
    FormFieldMetadata 
} from "@/lib/pdf-form-utils";
import { 
    FileEdit, 
    Download, 
    CheckCircle2, 
    Loader2, 
    Zap, 
    Layers, 
    Sliders, 
    ShieldCheck, 
    CheckSquare 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FormFillerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
    const [fields, setFields] = useState<FormFieldMetadata[]>([]);
    const [values, setValues] = useState<Record<string, string | boolean>>({});
    const [isInspecting, setIsInspecting] = useState(false);
    const [flattenForm, setFlattenForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [filledPdfUrl, setFilledPdfUrl] = useState<string | null>(null);

    const loadFormBytes = async (bytes: Uint8Array, filename: string) => {
        setIsInspecting(true);
        setFilledPdfUrl(null);
        try {
            setPdfBytes(bytes);
            const { fields: detectedFields } = await inspectAcroFormFields(bytes);
            setFields(detectedFields);

            const initialVals: Record<string, string | boolean> = {};
            detectedFields.forEach(f => {
                initialVals[f.name] = f.value;
            });
            setValues(initialVals);
        } catch (e) {
            console.error("Failed to inspect form fields:", e);
            alert("Could not detect form fields in this PDF.");
        } finally {
            setIsInspecting(false);
        }
    };

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        const buffer = await selectedFile.arrayBuffer();
        await loadFormBytes(new Uint8Array(buffer), selectedFile.name);
    };

    const loadSampleForm = async () => {
        setIsInspecting(true);
        try {
            const sampleBytes = await createSampleAcroForm();
            const dummyFile = new File([sampleBytes as any], "Standard_Application_Form.pdf", {
                type: "application/pdf"
            });
            setFile(dummyFile);
            await loadFormBytes(sampleBytes, "Standard_Application_Form.pdf");
        } catch (e) {
            console.error("Failed to create sample form", e);
        } finally {
            setIsInspecting(false);
        }
    };

    const handleValueChange = (fieldName: string, val: string | boolean) => {
        setValues(prev => ({
            ...prev,
            [fieldName]: val
        }));
    };

    const handleFillAndSave = async () => {
        if (!pdfBytes) return;
        setIsSaving(true);

        try {
            const resultBytes = await fillAcroForm(pdfBytes, values, flattenForm);
            const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setFilledPdfUrl(url);
        } catch (err) {
            console.error("Failed to fill form:", err);
            alert("Failed to save filled PDF.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <FileEdit className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Interactive PDF Form Filler
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Easily fill out interactive PDF forms, checkboxes, dropdown menus, and text fields on tax, government, or employment documents.
                </p>
            </div>

            {!pdfBytes ? (
                <div className="space-y-4">
                    <PDFUploader
                        onFileSelect={handleFileSelect}
                        title="Drop fillable PDF form here"
                        subtitle="Detects official text inputs, checkboxes, and select menus"
                    />

                    <div className="text-center pt-2">
                        <Button
                            variant="outline"
                            onClick={loadSampleForm}
                            disabled={isInspecting}
                            className="text-xs gap-1.5 cursor-pointer border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        >
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            <span>Try Sample Verification &amp; Application Form</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-6 shadow-xs">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <FileEdit className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm sm:max-w-md">
                                    {file?.name || "Fillable Form"}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {fields.length} Fillable Fields Detected
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                                setPdfBytes(null);
                                setFile(null);
                                setFields([]);
                                setFilledPdfUrl(null);
                            }}
                        >
                            Load Another Document
                        </Button>
                    </div>

                    {isInspecting ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                            <span>Finding fillable form fields...</span>
                        </div>
                    ) : fields.length === 0 ? (
                        <div className="p-8 text-center space-y-3">
                            <p className="text-sm font-semibold text-foreground">
                                No interactive form fields were found in this document.
                            </p>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                This PDF might be a flat scan without fillable fields. You can use our Smart Editor to add text, or try our sample form.
                            </p>
                            <Button
                                variant="outline"
                                onClick={loadSampleForm}
                                className="text-xs gap-1.5 cursor-pointer"
                            >
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                <span>Load Sample Application Form</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Detected Fields Form List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {fields.map((field) => (
                                    <div
                                        key={field.name}
                                        className={cn(
                                            "p-3 rounded-lg border border-border/60 bg-secondary/20 space-y-1.5",
                                            field.type === 'checkbox' && "sm:col-span-2 flex items-center justify-between"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-foreground capitalize">
                                                {field.name.replace(/([A-Z])/g, ' $1')}
                                            </Label>
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-card border border-border/50">
                                                {field.type}
                                            </span>
                                        </div>

                                        {field.type === 'text' && (
                                            <Input
                                                value={(values[field.name] as string) || ''}
                                                onChange={(e) => handleValueChange(field.name, e.target.value)}
                                                className="h-8 text-xs font-medium"
                                                placeholder={`Enter ${field.name}`}
                                            />
                                        )}

                                        {field.type === 'dropdown' && (
                                            <select
                                                value={(values[field.name] as string) || ''}
                                                onChange={(e) => handleValueChange(field.name, e.target.value)}
                                                className="w-full h-8 px-2 text-xs rounded-lg border border-border/70 bg-card text-foreground cursor-pointer"
                                            >
                                                {field.options?.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {field.type === 'checkbox' && (
                                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(values[field.name])}
                                                    onChange={(e) => handleValueChange(field.name, e.target.checked)}
                                                    className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                                                />
                                                <span className="text-xs text-muted-foreground">Checked</span>
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Flatten Option */}
                            <div className="p-3 rounded-lg border border-border/60 bg-secondary/15 flex items-center justify-between text-xs">
                                <div className="space-y-0.5">
                                    <span className="font-semibold text-foreground">
                                        Flatten Form Fields (Recommended for Final Submission)
                                    </span>
                                    <p className="text-[11px] text-muted-foreground">
                                        Permanently burns your entered text into the document so values cannot be altered by others.
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={flattenForm}
                                    onChange={(e) => setFlattenForm(e.target.checked)}
                                    className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                                />
                            </div>

                            {/* Save and Download */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                                <Button
                                    onClick={handleFillAndSave}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto h-10 px-6 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Saving Form Values...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Export Filled PDF</span>
                                        </>
                                    )}
                                </Button>

                                {filledPdfUrl && (
                                    <a
                                        href={filledPdfUrl}
                                        download={`${file?.name.replace(/\.pdf$/i, '') || 'form'}_filled.pdf`}
                                    >
                                        <Button
                                            variant="outline"
                                            className="h-10 px-5 text-xs font-bold gap-2 cursor-pointer border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Download Filled Document</span>
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
