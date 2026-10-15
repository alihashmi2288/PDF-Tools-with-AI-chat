"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { protectPdfDocument } from "@/lib/pdf-security-utils";
import { 
    Lock, 
    ShieldCheck, 
    Download, 
    CheckCircle2, 
    Loader2, 
    KeyRound, 
    Eye, 
    EyeOff, 
    ShieldAlert 
} from "lucide-react";

export default function ProtectPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [userPassword, setUserPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // Permissions
    const [allowPrinting, setAllowPrinting] = useState(true);
    const [allowCopying, setAllowCopying] = useState(false);
    const [allowModifying, setAllowModifying] = useState(false);
    const [allowFillingForms, setAllowFillingForms] = useState(true);

    const [isProtecting, setIsProtecting] = useState(false);
    const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setProtectedPdfUrl(null);
    };

    const handleProtect = async () => {
        if (!file) return;
        if (!userPassword) {
            alert("Please provide a password to protect your PDF.");
            return;
        }
        if (userPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setIsProtecting(true);
        try {
            const buffer = await file.arrayBuffer();
            const encryptedBytes = await protectPdfDocument(new Uint8Array(buffer), {
                userPassword,
                algorithm: 'AES-256',
                allowPrinting,
                allowCopying,
                allowModifying,
                allowFillingForms,
            });

            const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setProtectedPdfUrl(url);
        } catch (error: any) {
            console.error("Encryption failed:", error);
            alert("Failed to encrypt PDF: " + (error?.message || "Unknown error"));
        } finally {
            setIsProtecting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Lock className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Protect PDF with Password (AES-256)
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Encrypt your confidential PDFs with military-grade AES-256 standard encryption and lock down copying or editing permissions.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop PDF to password protect"
                    subtitle="Zero-knowledge encryption • Powered locally in your browser with Web Crypto"
                />
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • Encryption: AES-256
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                                setFile(null);
                                setProtectedPdfUrl(null);
                            }}
                        >
                            Change File
                        </Button>
                    </div>

                    {!protectedPdfUrl ? (
                        <div className="space-y-4">
                            {/* Password Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Choose Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={userPassword}
                                            onChange={(e) => setUserPassword(e.target.value)}
                                            placeholder="Enter strong password"
                                            className="h-9 text-xs pr-8"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Granular Permissions Locks */}
                            <div className="space-y-2 pt-2 border-t border-border/40">
                                <span className="text-xs font-semibold text-foreground">
                                    Permission Locks (Security Policies):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-secondary/20 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allowPrinting}
                                            onChange={(e) => setAllowPrinting(e.target.checked)}
                                            className="rounded text-emerald-600 cursor-pointer"
                                        />
                                        <span>Allow Document Printing</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-secondary/20 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allowCopying}
                                            onChange={(e) => setAllowCopying(e.target.checked)}
                                            className="rounded text-emerald-600 cursor-pointer"
                                        />
                                        <span>Allow Copying Text / Content</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-secondary/20 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allowModifying}
                                            onChange={(e) => setAllowModifying(e.target.checked)}
                                            className="rounded text-emerald-600 cursor-pointer"
                                        />
                                        <span>Allow Modifying Pages</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-secondary/20 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allowFillingForms}
                                            onChange={(e) => setAllowFillingForms(e.target.checked)}
                                            className="rounded text-emerald-600 cursor-pointer"
                                        />
                                        <span>Allow Form Field Filling</span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleProtect}
                                disabled={isProtecting || !userPassword}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isProtecting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Encrypting PDF with AES-256...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        <span>Encrypt &amp; Lock PDF</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 text-center">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-sm text-foreground">
                                    PDF Successfully Encrypted!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Your file now requires the password to open in Adobe Acrobat or any browser.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <a
                                    href={protectedPdfUrl}
                                    download={`${file.name.replace(/\.pdf$/i, '')}_protected.pdf`}
                                >
                                    <Button className="h-9 px-5 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Download Protected PDF</span>
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
