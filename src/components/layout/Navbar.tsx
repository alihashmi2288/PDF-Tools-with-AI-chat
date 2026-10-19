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
import { PDFKitLogo } from '@/components/ui/PDFKitLogo';

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
        <header className="sticky top-0 z-50 w-full border-b border-hairline bg-surface-1/80 backdrop-blur-xl transition-colors">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
                <div className="flex items-center gap-6 lg:gap-8">
                    {/* Mobile Menu Trigger */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-ink-subtle hover:text-ink">
                                <Menu className="h-4 w-4" />
                                <span className="sr-only">Toggle navigation</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] p-6 bg-surface-1 border-r border-hairline overflow-y-auto subtle-scrollbar text-ink">
                            <SheetTitle className="sr-only">Navigation</SheetTitle>
                            <div className="flex flex-col gap-6">
                                <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                                    <PDFKitLogo size={28} />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm tracking-tight text-ink">PDFKit</span>
                                        <span className="type-mono-eyebrow text-[10px] text-ink-subtle">Fast &amp; 100% Private</span>
                                    </div>
                                </Link>

                                <nav className="flex flex-col gap-1.5">
                                    {navLinks.map((link) => (
                                        <Link 
                                            key={link.href}
                                            href={link.href} 
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "px-3 py-2 text-xs rounded-[8px] transition-colors flex items-center justify-between",
                                                pathname === link.href 
                                                    ? "bg-surface-2 text-ink font-medium border border-hairline" 
                                                    : "text-ink-subtle hover:text-ink hover:bg-surface-2/60"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {link.icon && <link.icon className="h-3.5 w-3.5 opacity-70" />}
                                                <span>{link.label}</span>
                                            </div>
                                            {link.badge && (
                                                <span className="type-mono-eyebrow text-[9px] px-1.5 py-0.5 rounded-[4px] bg-primary/15 text-primary-hover font-medium">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}

                                    {/* Mobile Categories */}
                                    <div className="pt-4 border-t border-hairline flex flex-col gap-1">
                                        <span className="type-mono-eyebrow text-[11px] text-ink-subtle px-3 py-1 uppercase tracking-[0.4px]">
                                            AI Superpowers
                                        </span>
                                        <Link href="/chat/workspace" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Multi-PDF Workspace</Link>
                                        <Link href="/tools/contract-scanner" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Contract Redliner</Link>
                                        <Link href="/tools/invoice-extractor" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Invoice Extractor</Link>
                                        <Link href="/tools/translate" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Document Translator</Link>
                                        <Link href="/tools/study-ai" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Flashcards &amp; Quiz</Link>
                                    </div>

                                    <div className="pt-3 border-t border-hairline flex flex-col gap-1">
                                        <span className="type-mono-eyebrow text-[11px] text-ink-subtle px-3 py-1 uppercase tracking-[0.4px]">
                                            Sign &amp; Security
                                        </span>
                                        <Link href="/tools/sign" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>e-Sign PDF</Link>
                                        <Link href="/tools/flatten-pdf" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Flatten PDF (Lock)</Link>
                                        <Link href="/tools/protect" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Protect (AES-256)</Link>
                                        <Link href="/tools/unlock" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Unlock PDF</Link>
                                        <Link href="/tools/form-filler" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Fill PDF Forms</Link>
                                        <Link href="/tools/pdf-to-pdfa" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>PDF/A Archival (ISO)</Link>
                                    </div>

                                    <div className="pt-3 border-t border-hairline flex flex-col gap-1">
                                        <span className="type-mono-eyebrow text-[11px] text-ink-subtle px-3 py-1 uppercase tracking-[0.4px]">
                                            Page Utilities
                                        </span>
                                        <Link href="/tools/delete-pages" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Delete Pages</Link>
                                        <Link href="/tools/rearrange-pages" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Rearrange Pages</Link>
                                        <Link href="/tools/extract-pages" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Extract Pages</Link>
                                        <Link href="/tools/merge" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Merge Documents</Link>
                                        <Link href="/tools/split" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Split PDF</Link>
                                        <Link href="/tools/compress" className="text-xs text-ink-subtle hover:text-ink py-1 px-3" onClick={() => setIsOpen(false)}>Compress PDF</Link>
                                    </div>

                                    <Link href="/about" className="text-xs text-ink-subtle hover:text-ink pt-4 px-3" onClick={() => setIsOpen(false)}>
                                        About Developer
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Linear-Style Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <PDFKitLogo size={28} />
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm tracking-tight text-ink">
                                PDFKit
                            </span>
                            <span className="hidden sm:inline-block type-mono-eyebrow text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-ink-muted border border-hairline">
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
                                        "px-3 py-1.5 rounded-[8px] transition-all flex items-center gap-1.5 text-xs font-medium",
                                        isActive
                                            ? "text-primary bg-primary/10 dark:bg-primary/20"
                                            : "text-ink-subtle hover:text-ink hover:bg-surface-2"
                                    )}
                                >
                                    {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
                                    <span>{link.label}</span>
                                    {link.badge && (
                                        <span className="type-mono-eyebrow text-[9px] px-1.5 py-0.2 rounded-full bg-primary/15 text-primary font-semibold ml-0.5">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Mega Dropdown for PDF Tools */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="px-3 py-1.5 rounded-[8px] text-xs text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors flex items-center gap-1.5 outline-none data-[state=open]:text-ink data-[state=open]:bg-surface-2 cursor-pointer font-medium">
                                <Layers className="h-3.5 w-3.5 opacity-70" />
                                <span>Tools</span>
                                <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[740px] p-5 grid grid-cols-4 gap-4 bg-surface-1/95 dark:bg-surface-1/95 backdrop-blur-xl border border-hairline shadow-2xl rounded-[12px]">
                                
                                {/* Col 1: AI Superpowers */}
                                <div className="space-y-1.5">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-ink-subtle px-2 py-1 flex items-center gap-1 tracking-[0.4px]">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        <span>AI Superpowers</span>
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/chat/workspace" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <FolderGit2 className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Multi-PDF Workspace</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/contract-scanner" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Scale className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Contract Redliner</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/invoice-extractor" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <ReceiptText className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Invoice Extractor</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/translate" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Languages className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Document Translator</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/study-ai" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <GraduationCap className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Flashcards &amp; Quiz</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 2: Sign & Security */}
                                <div className="space-y-1.5 border-l border-hairline pl-3">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-ink-subtle px-2 py-1 flex items-center gap-1 tracking-[0.4px]">
                                        <ShieldCheck className="h-3 w-3 text-ink" />
                                        <span>Sign &amp; Security</span>
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/sign" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer font-medium">
                                                <PenTool className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>e-Sign PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/flatten-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Lock className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Flatten PDF (Lock)</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-pdfa" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Award className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>PDF/A Archival</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/protect" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Lock className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Protect (AES-256)</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/unlock" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Unlock className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Unlock PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/form-filler" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <FileEdit className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Fill PDF Forms</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 3: Converters */}
                                <div className="space-y-1.5 border-l border-hairline pl-3">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-ink-subtle px-2 py-1 tracking-[0.4px]">
                                        Converters
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-txt" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <FileText className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>PDF to TXT</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/html-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Code className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>HTML to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pdf-to-html" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Globe className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>PDF to HTML</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/pptx-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Presentation className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>PowerPoint to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/epub-to-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <BookOpen className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>EPUB to PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/svg-pdf" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Shapes className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>SVG Vector</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                                {/* Col 4: Page Utilities */}
                                <div className="space-y-1.5 border-l border-hairline pl-3">
                                    <DropdownMenuLabel className="type-mono-eyebrow text-[10px] text-ink-subtle px-2 py-1 tracking-[0.4px]">
                                        Page Utilities
                                    </DropdownMenuLabel>
                                    <div className="space-y-0.5">
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/delete-pages" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Trash2 className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Delete Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/rearrange-pages" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <ArrowUpDown className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Rearrange Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/extract-pages" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Scissors className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Extract Pages</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/merge" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Combine className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Merge Documents</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/split" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Scissors className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Split PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tools/compress" className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-[6px] hover:bg-surface-3 cursor-pointer">
                                                <Minimize2 className="h-3.5 w-3.5 text-ink-subtle" />
                                                <span>Compress PDF</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </div>
                                </div>

                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link
                            href="/about"
                            className="px-3 py-1.5 rounded-[8px] text-xs text-ink-subtle hover:text-ink hover:bg-surface-1 transition-colors"
                        >
                            About
                        </Link>
                    </nav>
                </div>

                {/* Right app chrome controls */}
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-1.5 type-mono-eyebrow text-[11px] text-ink-muted px-2.5 py-1 rounded-full border border-hairline bg-surface-2 shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                        <span>100% Private</span>
                    </div>

                    <Link 
                        href="https://github.com/alihashmi2288" 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-[8px] border border-hairline bg-surface-1 text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors"
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
