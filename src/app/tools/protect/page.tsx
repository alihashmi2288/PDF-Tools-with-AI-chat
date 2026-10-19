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
        <div className="max-w-2xl mx-auto py-6 space-y-6">
            <div className="space-y-1.5 border-b border-hairline pb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Lock className="h-4 w-4" />
                    </div>
                    <h1 className="type-headline text-ink">
                        Protect PDF with Password (AES-256)
                    </h1>
                </div>
                <p className="type-subhead text-ink-subtle">
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
                <div className="hairline-card p-6 rounded-[12px] bg-surface-1 space-y-5">
                    <div className="flex items-center justify-between border-b border-hairline pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-ink truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="type-caption font-mono text-ink-subtle">
                                    {(file.size / 1024).toFixed(1)} KB • Encryption: AES-256
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-ink-subtle hover:text-ink cursor-pointer rounded-[6px]"
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
                                    <Label className="type-eyebrow text-ink-subtle">
                                        Choose Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={userPassword}
                                            onChange={(e) => setUserPassword(e.target.value)}
                                            placeholder="Enter strong password"
                                            className="h-9 text-xs pr-8 bg-surface-2 border-hairline rounded-[8px]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-2.5 text-ink-tertiary hover:text-ink cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="type-eyebrow text-ink-subtle">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        className="h-9 text-xs bg-surface-2 border-hairline rounded-[8px]"
                                    />
                                </div>
                            </div>

                            {/* Granular Permissions Locks */}
                            <div className="space-y-2 pt-2 border-t border-hairline">
                                <span className="type-eyebrow text-ink-subtle block">
                                    Permission Locks (Security Policies):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <label className="flex items-center gap-2 p-2.5 rounded-[8px] border border-hairline bg-surface-2 text-ink cursor-pointer hover:bg-surface-3 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={allowPrinting}
                                            onChange={(e) => setAllowPrinting(e.target.checked)}
                                            className="rounded-[4px] accent-primary cursor-pointer"
                                        />
                                        <span>Allow Document Printing</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 rounded-[8px] border border-hairline bg-surface-2 text-ink cursor-pointer hover:bg-surface-3 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={allowCopying}
                                            onChange={(e) => setAllowCopying(e.target.checked)}
                                            className="rounded-[4px] accent-primary cursor-pointer"
                                        />
                                        <span>Allow Copying Text / Content</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 rounded-[8px] border border-hairline bg-surface-2 text-ink cursor-pointer hover:bg-surface-3 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={allowModifying}
                                            onChange={(e) => setAllowModifying(e.target.checked)}
                                            className="rounded-[4px] accent-primary cursor-pointer"
                                        />
                                        <span>Allow Modifying Pages</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 rounded-[8px] border border-hairline bg-surface-2 text-ink cursor-pointer hover:bg-surface-3 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={allowFillingForms}
                                            onChange={(e) => setAllowFillingForms(e.target.checked)}
                                            className="rounded-[4px] accent-primary cursor-pointer"
                                        />
                                        <span>Allow Form Field Filling</span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleProtect}
                                disabled={isProtecting || !userPassword}
                                className="button-primary w-full h-10 text-xs font-medium gap-2 cursor-pointer rounded-[8px]"
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
                        <div className="p-5 rounded-[12px] border border-[#16a34a]/30 bg-[#16a34a]/5 space-y-4 text-center">
                            <div className="h-10 w-10 rounded-full bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center mx-auto border border-[#16a34a]/20">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="type-card-title text-ink">
                                    PDF Successfully Encrypted!
                                </h3>
                                <p className="type-caption text-ink-subtle">
                                    Your file now requires the password to open in Adobe Acrobat or any browser.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <a
                                    href={protectedPdfUrl}
                                    download={`${file.name.replace(/\.pdf$/i, '')}_protected.pdf`}
                                >
                                    <Button className="button-primary h-9 px-5 text-xs font-medium gap-2 cursor-pointer rounded-[8px]">
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
