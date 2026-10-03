'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    Github, 
    ChevronDown, 
    Menu, 
    Sparkles, 
    Combine, 
    Scissors, 
    Minimize2, 
    SlidersHorizontal, 
    ScanText, 
    ImagePlus, 
    FileSpreadsheet, 
    FileCode, 
    ShieldCheck,
    Layers
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Workspace" },
        { href: "/documents", label: "Viewer & Editor" },
        { href: "/chat", label: "AI Document Chat", icon: Sparkles },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
                <div className="flex items-center gap-6 lg:gap-8">
                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Menu className="h-4 w-4" />
                                <span className="sr-only">Toggle navigation</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] p-6 bg-background/95 backdrop-blur-xl">
                            <SheetTitle className="sr-only">Navigation</SheetTitle>
                            <div className="flex flex-col gap-6">
                                <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                                    <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
                                        P
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm tracking-tight">PDF AI Master</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">Precision Studio</span>
                                    </div>
                                </Link>

                                <nav className="flex flex-col gap-1.5">
                                    {navLinks.map((link) => (
                                        <Link 
                                            key={link.href}
                                            href={link.href} 
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                                                pathname === link.href 
                                                    ? "bg-secondary text-foreground font-medium" 
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {link.icon && <link.icon className="h-3.5 w-3.5 text-blue-500" />}
                                            {link.label}
                                        </Link>
                                    ))}

                                    <div className="pt-4 border-t border-border/40 flex flex-col gap-2">
                                        <span className="text-xs font-semibold text-muted-foreground px-3">PDF Operations</span>
                                        <div className="pl-3 flex flex-col gap-1">
                                            <Link href="/tools/merge" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Merge PDFs</Link>
                                            <Link href="/tools/split" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Split PDF</Link>
                                            <Link href="/tools/compress" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Compress PDF</Link>
                                            <Link href="/tools/edit" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Edit PDF</Link>
                                            <Link href="/tools/ocr" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>OCR Scanner</Link>
                                        </div>

                                        <span className="text-xs font-semibold text-muted-foreground px-3 pt-2">Converters</span>
                                        <div className="pl-3 flex flex-col gap-1">
                                            <Link href="/tools/image-to-pdf" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Images to PDF</Link>
                                            <Link href="/tools/docx-to-pdf" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>DOCX to PDF</Link>
                                            <Link href="/tools/excel-to-pdf" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Excel to PDF</Link>
                                            <Link href="/tools/csv-to-pdf" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>CSV to PDF</Link>
                                            <Link href="/tools/markdown-to-pdf" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Markdown to PDF</Link>
                                        </div>
                                    </div>

                                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground pt-4 px-3" onClick={() => setIsOpen(false)}>
                                        About Developer
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-7 w-7 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs tracking-wider shadow-xs transition-transform group-hover:scale-105">
                            P
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm tracking-tight text-foreground">
                                PDF AI Master
                            </span>
                            <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/60">
                                v1.0
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1 text-xs font-medium">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5",
                                        isActive
                                            ? "text-foreground bg-secondary font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {Icon && <Icon className="h-3.5 w-3.5 text-blue-500" />}
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {/* Mega Dropdown for Tools */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 outline-none data-[state=open]:text-foreground data-[state=open]:bg-secondary">
                                <Layers className="h-3.5 w-3.5" />
                                <span>Tool Suites</span>
                                <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[420px] p-3 grid grid-cols-2 gap-2 bg-popover/95 backdrop-blur-xl border-border/70 shadow-lg">
                                <div>
                                    <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 py-1">
                                        PDF Operations
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/merge" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Combine className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Merge Documents</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/split" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Split Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/compress" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Compress Size</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/edit" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Smart Editor</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/ocr" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <ScanText className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>OCR Scanner</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                <div className="border-l border-border/40 pl-2">
                                    <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 py-1">
                                        Converters
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/image-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Images to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/docx-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>DOCX to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/excel-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Excel to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/csv-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>CSV to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/markdown-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Markdown to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link
                            href="/about"
                            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                            About
                        </Link>
                    </nav>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/80 px-2.5 py-1 rounded-full border border-border/50 bg-secondary/40">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Client Sandbox</span>
                    </div>

                    <Link 
                        href="https://github.com/alihashmi2288" 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        title="GitHub Source"
                    >
                        <Github className="h-3.5 w-3.5" />
                        <span className="sr-only">GitHub</span>
                    </Link>

                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
