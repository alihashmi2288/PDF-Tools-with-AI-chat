'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    Github, 
    ChevronDown, 
    Menu, 
    Sparkles, 
    Combine, 
    Scissors, 
    Minimize2, 
    SlidersHorizontal, 
    ScanText, 
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
    Image as ImageIcon,
    Trash2,
    ArrowUpDown,
    Moon,
    Maximize2,
    Tag,
    Bookmark,
    Globe,
    Shapes,
    Award,
    Tablet,
    Code,
    FileText
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
        { href: "/", label: "Overview" },
        { href: "/tools/view", label: "PDF Reader", icon: BookOpen },
        { href: "/tools/edit", label: "Canvas Editor", icon: SlidersHorizontal },
        { href: "/chat/workspace", label: "Workspace", icon: FolderGit2, badge: "AI" },
        { href: "/chat", label: "AI Chat", icon: Sparkles },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
                <div className="flex items-center gap-6 lg:gap-8">
                    {/* Mobile Menu Trigger */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Menu className="h-4 w-4" />
                                <span className="sr-only">Toggle navigation</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] p-6 bg-card border-r border-border overflow-y-auto subtle-scrollbar">
                            <SheetTitle className="sr-only">Navigation</SheetTitle>
                            <div className="flex flex-col gap-6">
                                <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                                    <div className="h-7 w-7 rounded-[6px] bg-foreground text-background flex items-center justify-center font-bold text-xs">
                                        ▲
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm tracking-tight text-foreground">PDF AI Master</span>
                                        <span className="type-mono-eyebrow text-[10px] text-muted-foreground">Fast &amp; 100% Private</span>
                                    </div>
                                </Link>

                                <nav className="flex flex-col gap-1.5">
                                    {navLinks.map((link) => (
                                        <Link 
                                            key={link.href}
                                            href={link.href} 
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "px-3 py-2 text-xs rounded-[6px] transition-colors flex items-center justify-between",
                                                pathname === link.href 
                                                    ? "bg-secondary text-foreground font-medium" 
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {link.icon && <link.icon className="h-3.5 w-3.5 text-foreground/70" />}
                                                <span>{link.label}</span>
                                            </div>
                                            {link.badge && (
                                                <span className="type-mono-eyebrow text-[9px] px-1.5 py-0.5 rounded-[4px] bg-foreground/10 text-foreground">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}

                                    {/* Mobile Categories */}
                                    <div className="pt-4 border-t border-border flex flex-col gap-1">
                                        <span className="type-mono-eyebrow text-[11px] text-muted-foreground px-3 py-1">
                                            AI Superpowers
                                        </span>
                                        <Link href="/chat/workspace" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Multi-PDF Workspace</Link>
                                        <Link href="/tools/contract-scanner" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Contract Redliner</Link>
                                        <Link href="/tools/invoice-extractor" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Invoice Extractor</Link>
                                        <Link href="/tools/translate" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Document Translator</Link>
                                        <Link href="/tools/study-ai" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Flashcards &amp; Quiz</Link>
                                    </div>

                                    <div className="pt-3 border-t border-border flex flex-col gap-1">
                                        <span className="type-mono-eyebrow text-[11px] text-muted-foreground px-3 py-1">
                                            Sign &amp; Security
                                        </span>
                                        <Link href="/tools/sign" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>e-Sign PDF</Link>
                                        <Link href="/tools/flatten-pdf" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Flatten PDF (Lock)</Link>
                                        <Link href="/tools/protect" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Protect (AES-256)</Link>
                                        <Link href="/tools/unlock" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Unlock PDF</Link>
                                        <Link href="/tools/form-filler" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Fill PDF Forms</Link>
                                        <Link href="/tools/pdf-to-pdfa" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>PDF/A Archival (ISO)</Link>
                                    </div>

                                    <div className="pt-3 border-t border-border flex flex-col gap-1">
                                        <span className="type-mono-eyebrow text-[11px] text-muted-foreground px-3 py-1">
                                            Page Utilities
                                        </span>
                                        <Link href="/tools/delete-pages" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Delete Pages</Link>
                                        <Link href="/tools/rearrange-pages" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Rearrange Pages</Link>
                                        <Link href="/tools/extract-pages" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Extract Pages</Link>
                                        <Link href="/tools/merge" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Merge Documents</Link>
                                        <Link href="/tools/split" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Split PDF</Link>
                                        <Link href="/tools/compress" className="text-xs text-muted-foreground hover:text-foreground py-1 px-3" onClick={() => setIsOpen(false)}>Compress PDF</Link>
                                    </div>

                                    <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground pt-4 px-3" onClick={() => setIsOpen(false)}>
                                        About Developer
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Vercel-Style Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-7 w-7 rounded-[6px] bg-[#171717] dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs tracking-wider transition-transform group-hover:scale-105">
                            ▲
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm tracking-tight text-foreground">
                                PDF AI Master
                            </span>
                            <span className="hidden sm:inline-block type-mono-eyebrow text-[10px] px-1.5 py-0.5 rounded-[4px] bg-secondary text-muted-foreground border border-border">
                                Private
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-1 text-xs">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-normal",
                                        isActive
                                            ? "text-foreground bg-secondary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                                    )}
                                >
                                    {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
                                    <span>{link.label}</span>
                                    {link.badge && (
                                        <span className="type-mono-eyebrow text-[9px] px-1 py-0.2 rounded bg-foreground/10 text-foreground font-semibold ml-0.5">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Mega Dropdown for PDF Tools */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors flex items-center gap-1 outline-none data-[state=open]:text-foreground data-[state=open]:bg-secondary cursor-pointer">
                                <Layers className="h-3.5 w-3.5 opacity-70" />
                                <span>Tools</span>
                                <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[740px] p-5 grid grid-cols-4 gap-4 bg-card border border-border shadow-md rounded-xl">
                                
                                {/* Col 1: AI Superpowers */}
                                <div className="space-y-1.5">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-muted-foreground px-2 py-1 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-foreground" />
                                        <span>AI Superpowers</span>
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/chat/workspace" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Multi-PDF Workspace</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/contract-scanner" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Contract Redliner</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/invoice-extractor" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <ReceiptText className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Invoice Extractor</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/translate" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Document Translator</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/study-ai" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Flashcards &amp; Quiz</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 2: Sign & Security */}
                                <div className="space-y-1.5 border-l border-border pl-3">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-muted-foreground px-2 py-1 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3 text-foreground" />
                                        <span>Sign &amp; Security</span>
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/sign" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer font-medium">
                                                <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>e-Sign PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/flatten-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Flatten PDF (Lock)</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-pdfa" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>PDF/A Archival</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/protect" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Protect (AES-256)</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/unlock" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Unlock PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/form-filler" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <FileEdit className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Fill PDF Forms</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 3: Converters */}
                                <div className="space-y-1.5 border-l border-border pl-3">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-muted-foreground px-2 py-1">
                                        Converters
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-txt" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>PDF to TXT</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/html-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Code className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>HTML to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-html" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>PDF to HTML</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pptx-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Presentation className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>PowerPoint to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/epub-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>EPUB to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/svg-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Shapes className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>SVG Vector</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 4: Page Utilities */}
                                <div className="space-y-1.5 border-l border-border pl-3">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-muted-foreground px-2 py-1">
                                        Page Utilities
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/delete-pages" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Delete Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/rearrange-pages" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Rearrange Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/extract-pages" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Extract Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/merge" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Combine className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Merge Documents</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/split" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Split PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/compress" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-secondary cursor-pointer">
                                                <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Compress PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link
                            href="/about"
                            className="px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                        >
                            About
                        </Link>
                    </nav>
                </div>

                {/* Right app chrome controls: 6px buttons */}
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-1.5 type-mono-eyebrow text-[11px] text-muted-foreground px-2.5 py-1 rounded-[6px] border border-border bg-card">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>100% Private</span>
                    </div>

                    <Link 
                        href="https://github.com/alihashmi2288" 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-[6px] border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
