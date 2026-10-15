import Link from "next/link";
import { ShieldCheck, Cpu, Lock } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/60 bg-background/50 py-8 px-4 md:px-8 text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                    <span className="font-semibold text-foreground tracking-tight">PDF AI Master</span>
                    <span className="hidden sm:inline text-border">•</span>
                    <span>Simple, fast, and 100% private PDF tools</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                        <Lock className="h-3 w-3 text-emerald-500" />
                        <span>Files Never Leave Your Device</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                        <ShieldCheck className="h-3 w-3 text-blue-500" />
                        <span>No Account Needed • Always Free</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                    <Link href="/about" className="hover:text-foreground transition-colors">
                        About Developer
                    </Link>
                    <a 
                        href="https://github.com/alihashmi2288" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:text-foreground transition-colors"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}
