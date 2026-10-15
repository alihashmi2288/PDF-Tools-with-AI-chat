"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockPdfDocument, checkIsPdfEncrypted } from "@/lib/pdf-security-utils";
import { 
    Unlock, 
    KeyRound, 
    Download, 
    CheckCircle2, 
    Loader2, 
    ShieldCheck, 
    AlertCircle 
} from "lucide-react";

export default function UnlockPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [isEncryptedDoc, setIsEncryptedDoc] = useState<boolean | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setUnlockedPdfUrl(null);
        setErrorMessage(null);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const info = await checkIsPdfEncrypted(new Uint8Array(buffer));
            setIsEncryptedDoc(info.encrypted);
        } catch {
            setIsEncryptedDoc(true);
        }
    };

    const handleUnlock = async () => {
        if (!file || !password) return;
        setIsUnlocking(true);
        setErrorMessage(null);

        try {
            const buffer = await file.arrayBuffer();
            const decryptedBytes = await unlockPdfDocument(new Uint8Array(buffer), password);

            const blob = new Blob([decryptedBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setUnlockedPdfUrl(url);
        } catch (err: any) {
            console.error("Unlock error:", err);
            setErrorMessage(err?.message || "Incorrect password or decryption failed.");
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <Unlock className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Unlock PDF (Remove Password)
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Provide your known document password to permanently strip the password lock and export a clean, completely unlocked PDF.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop locked PDF to unlock"
                    subtitle="Removes open passwords and print/copy restrictions permanently"
                />
            ) : (
                <div className="p-6 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <KeyRound className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground truncate max-w-sm">
                                    {file.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • {isEncryptedDoc ? "Password Detected" : "Ready to process"}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                                setFile(null);
                                setUnlockedPdfUrl(null);
                            }}
                        >
                            Choose Another File
                        </Button>
                    </div>

                    {!unlockedPdfUrl ? (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground">
                                    Enter Current Document Password
                                </Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter known PDF password"
                                    className="h-9 text-xs"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUnlock();
                                    }}
                                />
                            </div>

                            {errorMessage && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleUnlock}
                                disabled={isUnlocking || !password}
                                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {isUnlocking ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Decrypting &amp; Removing Restrictions...</span>
                                    </>
                                ) : (
                                    <>
                                        <Unlock className="h-4 w-4" />
                                        <span>Permanently Remove Password</span>
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
                                    Document Unlocked!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    All password prompts and security restrictions have been stripped from this file.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <a
                                    href={unlockedPdfUrl}
                                    download={`${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`}
                                >
                                    <Button className="h-9 px-5 text-xs font-semibold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Download Unlocked PDF</span>
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
