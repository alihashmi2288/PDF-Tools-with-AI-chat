import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { PDFKitLogo } from "@/components/ui/PDFKitLogo";

export function Footer() {
    return (
        <footer className="border-t border-hairline bg-surface-1 py-12 px-4 md:px-8 text-xs text-ink-subtle mt-auto transition-colors">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="space-y-3 md:col-span-1">
                        <div className="flex items-center gap-2">
                            <PDFKitLogo size={24} />
                            <span className="font-semibold text-sm tracking-tight text-ink">
                                PDFKit
                            </span>
                        </div>
                        <p className="text-xs text-ink-subtle leading-relaxed">
                            The fast, simple, and 100% private way to edit, convert, and chat with your documents directly in your browser.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="type-mono-eyebrow text-[10px] text-ink-muted px-2 py-0.5 rounded-full border border-hairline bg-surface-2">
                                100% Private • Always Free
                            </span>
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="space-y-2">
                        <p className="type-eyebrow text-[11px] text-ink font-semibold tracking-[0.4px] uppercase">
                            Popular Tools
                        </p>
                        <ul className="space-y-1.5 text-xs text-ink-subtle">
                            <li>
                                <Link href="/chat/workspace" className="hover:text-ink transition-colors">
                                    Multi-Document Workspace
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/view" className="hover:text-ink transition-colors">
                                    PDF Reader Studio
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/edit" className="hover:text-ink transition-colors">
                                    Canvas PDF Editor
                                </Link>
                            </li>
                            <li>
                                <Link href="/chat" className="hover:text-ink transition-colors">
                                    Chat with AI
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Everyday Utilities */}
                    <div className="space-y-2">
                        <p className="type-eyebrow text-[11px] text-ink font-semibold tracking-[0.4px] uppercase">
                            Everyday Tools
                        </p>
                        <ul className="space-y-1.5 text-xs text-ink-subtle">
                            <li>
                                <Link href="/tools/merge" className="hover:text-ink transition-colors">
                                    Merge Documents
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/delete-pages" className="hover:text-ink transition-colors">
                                    Delete Pages
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/compress" className="hover:text-ink transition-colors">
                                    Compress File Size
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/sign" className="hover:text-ink transition-colors">
                                    e-Sign &amp; Stamp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Platform & Developer */}
                    <div className="space-y-2">
                        <p className="type-eyebrow text-[11px] text-ink font-semibold tracking-[0.4px] uppercase">
                            About
                        </p>
                        <ul className="space-y-1.5 text-xs text-ink-subtle">
                            <li>
                                <Link href="/about" className="hover:text-ink transition-colors">
                                    About Developer
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="https://github.com/alihashmi2288" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="hover:text-ink transition-colors"
                                >
                                    GitHub Source
                                </a>
                            </li>
                            <li>
                                <span className="text-ink-tertiary">Processes on your device</span>
                            </li>
                            <li>
                                <span className="text-ink-tertiary">No tracking • No signups</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                    <div className="flex items-center gap-4 text-ink-subtle">
                        <span className="type-mono-eyebrow text-[10px] text-ink-subtle">
                            © {new Date().getFullYear()} PDFKit
                        </span>
                        <span>•</span>
                        <span>Runs on your computer</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-ink-subtle">
                            <Lock className="h-3 w-3 text-[#16a34a]" />
                            <span>Files Never Leave Your Device</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-ink-subtle">
                            <ShieldCheck className="h-3 w-3 text-ink" />
                            <span>100% Confidential</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
