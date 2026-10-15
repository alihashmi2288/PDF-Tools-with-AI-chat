import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-background py-12 px-4 md:px-8 text-xs text-muted-foreground mt-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="space-y-3 md:col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-[6px] bg-[#171717] dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-[10px]">
                                ▲
                            </div>
                            <span className="font-semibold text-sm tracking-tight text-foreground">
                                PDF AI Master
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            The fast, simple, and 100% private way to edit, convert, and chat with your documents directly in your browser.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="type-mono-eyebrow text-[10px] text-muted-foreground px-2 py-0.5 rounded-[4px] border border-border bg-card">
                                100% Private • Always Free
                            </span>
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="space-y-2">
                        <p className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
                            Popular Tools
                        </p>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                            <li>
                                <Link href="/chat/workspace" className="hover:text-foreground transition-colors">
                                    Multi-Document Workspace
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/view" className="hover:text-foreground transition-colors">
                                    PDF Reader Studio
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/edit" className="hover:text-foreground transition-colors">
                                    Canvas PDF Editor
                                </Link>
                            </li>
                            <li>
                                <Link href="/chat" className="hover:text-foreground transition-colors">
                                    Chat with AI
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Everyday Utilities */}
                    <div className="space-y-2">
                        <p className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
                            Everyday Tools
                        </p>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                            <li>
                                <Link href="/tools/merge" className="hover:text-foreground transition-colors">
                                    Merge Documents
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/delete-pages" className="hover:text-foreground transition-colors">
                                    Delete Pages
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/compress" className="hover:text-foreground transition-colors">
                                    Compress File Size
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools/sign" className="hover:text-foreground transition-colors">
                                    e-Sign &amp; Stamp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Platform & Developer */}
                    <div className="space-y-2">
                        <p className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
                            About
                        </p>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                            <li>
                                <Link href="/about" className="hover:text-foreground transition-colors">
                                    About Developer
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="https://github.com/alihashmi2288" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="hover:text-foreground transition-colors"
                                >
                                    GitHub Source
                                </a>
                            </li>
                            <li>
                                <span className="text-muted-foreground/70">Processes on your device</span>
                            </li>
                            <li>
                                <span className="text-muted-foreground/70">No tracking • No signups</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                    <div className="flex items-center gap-4">
                        <span className="type-mono-eyebrow text-[10px] text-muted-foreground">
                            © {new Date().getFullYear()} PDF AI Master
                        </span>
                        <span>•</span>
                        <span>Runs on your computer</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Lock className="h-3 w-3 text-emerald-500" />
                            <span>Files Never Leave Your Device</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ShieldCheck className="h-3 w-3 text-foreground" />
                            <span>100% Confidential</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
