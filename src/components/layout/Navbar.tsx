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
    Layers,
    PenTool,
    Lock,
    Unlock,
    RotateCw,
    Crop,
    Hash,
    Stamp,
    FileEdit,
    FolderGit2,
    Scale,
    ReceiptText,
    Languages,
    GraduationCap,
    BookOpen,
    Presentation,
    Image as ImageIcon
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/tools/view", label: "PDF Reader", icon: BookOpen },
        { href: "/tools/edit", label: "PDF Editor", icon: SlidersHorizontal },
        { href: "/chat/workspace", label: "Multi-PDF Workspace", icon: FolderGit2, badge: "AI" },
        { href: "/chat", label: "AI Chat", icon: Sparkles },
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
                        <SheetContent side="left" className="w-[320px] p-6 bg-background/95 backdrop-blur-xl overflow-y-auto">
                            <SheetTitle className="sr-only">Navigation</SheetTitle>
                            <div className="flex flex-col gap-5">
                                <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                                    <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
                                        P
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm tracking-tight">PDF AI Master</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">Fast &amp; 100% Private</span>
                                    </div>
                                </Link>

                                <nav className="flex flex-col gap-1.5">
                                    {navLinks.map((link) => (
                                        <Link 
                                            key={link.href}
                                            href={link.href} 
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between",
                                                pathname === link.href 
                                                    ? "bg-secondary text-foreground font-medium" 
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {link.icon && <link.icon className="h-3.5 w-3.5 text-blue-500" />}
                                                <span>{link.label}</span>
                                            </div>
                                            {link.badge && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}

                                    {/* Mobile AI Superpowers */}
                                    <div className="pt-3 border-t border-border/40 flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 px-3 flex items-center gap-1.5">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            <span>AI Superpowers</span>
                                        </span>
                                        <div className="pl-3 flex flex-col gap-0.5">
                                            <Link href="/chat/workspace" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Multi-PDF Workspace</Link>
                                            <Link href="/tools/contract-scanner" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Contract Redline &amp; Risk Scanner</Link>
                                            <Link href="/tools/invoice-extractor" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Invoice &amp; Table Extractor</Link>
                                            <Link href="/tools/translate" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Full-Document Translator</Link>
                                            <Link href="/tools/study-ai" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Flashcards &amp; Quiz Generator</Link>
                                        </div>
                                    </div>

                                    {/* Mobile Sign & Security */}
                                    <div className="pt-3 border-t border-border/40 flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 flex items-center gap-1.5">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            <span>Sign &amp; Security</span>
                                        </span>
                                        <div className="pl-3 flex flex-col gap-0.5">
                                            <Link href="/tools/sign" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>e-Sign PDF</Link>
                                            <Link href="/tools/protect" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Protect PDF (AES-256)</Link>
                                            <Link href="/tools/unlock" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Unlock PDF</Link>
                                            <Link href="/tools/form-filler" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Interactive Form Filler</Link>
                                        </div>
                                    </div>

                                    {/* Mobile Reverse Converters */}
                                    <div className="pt-3 border-t border-border/40 flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-foreground px-3">
                                            PDF Converters
                                        </span>
                                        <div className="pl-3 flex flex-col gap-0.5">
                                            <Link href="/tools/pdf-to-docx" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>PDF to Word (.docx)</Link>
                                            <Link href="/tools/pdf-to-xlsx" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>PDF to Excel (.xlsx)</Link>
                                            <Link href="/tools/pdf-to-pptx" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>PDF to PowerPoint (.pptx)</Link>
                                            <Link href="/tools/pdf-to-images" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>PDF to JPG &amp; PNG</Link>
                                        </div>
                                    </div>

                                    {/* Mobile Page Organize */}
                                    <div className="pt-3 border-t border-border/40 flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-foreground px-3">
                                            View, Edit &amp; Organize
                                        </span>
                                        <div className="pl-3 flex flex-col gap-0.5">
                                            <Link href="/tools/view" className="text-sm font-medium text-blue-600 dark:text-blue-400 py-1" onClick={() => setIsOpen(false)}>PDF Reader &amp; AI</Link>
                                            <Link href="/tools/edit" className="text-sm font-medium text-blue-600 dark:text-blue-400 py-1" onClick={() => setIsOpen(false)}>PDF Editor</Link>
                                            <Link href="/tools/rotate" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Rotate Pages</Link>
                                            <Link href="/tools/crop" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Crop PDF</Link>
                                            <Link href="/tools/page-numbers" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Add Page Numbers</Link>
                                            <Link href="/tools/watermark" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Custom Watermarks</Link>
                                            <Link href="/tools/merge" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Merge PDFs</Link>
                                            <Link href="/tools/split" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Split PDF</Link>
                                            <Link href="/tools/compress" className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setIsOpen(false)}>Compress PDF</Link>
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
                                v2.0
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
                                    {link.badge && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold ml-0.5">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Mega Dropdown for PDF Tools */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 outline-none data-[state=open]:text-foreground data-[state=open]:bg-secondary cursor-pointer">
                                <Layers className="h-3.5 w-3.5" />
                                <span>PDF Tools</span>
                                <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[720px] p-4 grid grid-cols-4 gap-4 bg-popover/95 backdrop-blur-xl border-border/70 shadow-xl">
                                
                                {/* Col 1: AI Superpowers */}
                                <div className="space-y-1">
                                    <DropdownMenuLabel className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        <span>AI Superpowers</span>
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/chat/workspace" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <FolderGit2 className="h-3.5 w-3.5 text-blue-500" />
                                                <span>Multi-PDF Workspace</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/contract-scanner" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Scale className="h-3.5 w-3.5 text-red-500" />
                                                <span>Contract Redliner</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/invoice-extractor" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <ReceiptText className="h-3.5 w-3.5 text-emerald-500" />
                                                <span>Invoice Extractor</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/translate" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Languages className="h-3.5 w-3.5 text-cyan-500" />
                                                <span>Document Translator</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/study-ai" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <GraduationCap className="h-3.5 w-3.5 text-violet-500" />
                                                <span>Flashcards &amp; Quiz</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 2: Sign & Security */}
                                <div className="space-y-1 border-l border-border/40 pl-3">
                                    <DropdownMenuLabel className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        <span>Sign &amp; Security</span>
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/sign" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer font-medium">
                                                <PenTool className="h-3.5 w-3.5 text-emerald-500" />
                                                <span>e-Sign PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/protect" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                                                <span>Protect (AES-256)</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/unlock" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Unlock className="h-3.5 w-3.5 text-amber-500" />
                                                <span>Unlock PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/form-filler" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <FileEdit className="h-3.5 w-3.5 text-teal-500" />
                                                <span>Fill PDF Forms</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 3: Reverse Converters */}
                                <div className="space-y-1 border-l border-border/40 pl-3">
                                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                        Convert From PDF
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-docx" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer font-medium">
                                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                                                <span>PDF to Word (.docx)</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-xlsx" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer font-medium">
                                                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                                                <span>PDF to Excel (.xlsx)</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-pptx" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer font-medium">
                                                <Presentation className="h-3.5 w-3.5 text-orange-500" />
                                                <span>PDF to PPTX</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-images" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer font-medium">
                                                <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
                                                <span>PDF to JPG &amp; PNG</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 4: Organize & Edit */}
                                <div className="space-y-1 border-l border-border/40 pl-3">
                                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                        Organize &amp; Edit
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/view" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer font-medium text-blue-600 dark:text-blue-400">
                                                <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                                <span>PDF Reader &amp; AI</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/edit" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer font-medium text-blue-600 dark:text-blue-400">
                                                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                                                <span>PDF Editor</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/rotate" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <RotateCw className="h-3.5 w-3.5 text-blue-500" />
                                                <span>Rotate Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/crop" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Crop className="h-3.5 w-3.5 text-teal-500" />
                                                <span>Crop PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/page-numbers" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Hash className="h-3.5 w-3.5 text-indigo-500" />
                                                <span>Page Numbers</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/watermark" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer">
                                                <Stamp className="h-3.5 w-3.5 text-rose-500" />
                                                <span>Watermarks</span>
                                            </Link>
                                        </DropdownMenuItem>
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
                    <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>100% Private (On-Device)</span>
                    </div>

                    <Link 
                        href="https://github.com/alihashmi2288" 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                    </Link>

                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
