'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Github, ChevronDown, Menu, Sparkles } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from 'react';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2 md:gap-8">
                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <div className="flex flex-col gap-6 py-4 px-6">
                                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className="font-bold text-lg">PDF AI Master</span>
                                </Link>
                                <nav className="flex flex-col gap-4">
                                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                                        Home
                                    </Link>
                                    <Link href="/documents" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                                        View PDF
                                    </Link>
                                    <Link href="/chat" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" onClick={() => setIsOpen(false)}>
                                        <Sparkles className="h-3 w-3 text-blue-500" />
                                        AI Chat
                                    </Link>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-muted-foreground">Tools</span>
                                        <div className="pl-4 flex flex-col gap-2 border-l">
                                            <Link href="/tools/merge" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Merge PDF</Link>
                                            <Link href="/tools/split" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Split PDF</Link>
                                            <Link href="/tools/compress" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Compress PDF</Link>
                                            <Link href="/tools/edit" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Edit PDF</Link>
                                            <Link href="/tools/ocr" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>OCR (Image to Text)</Link>
                                        </div>
                                    </div>

                                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                                        About the Developer
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors hidden md:block">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                            PDF AI Master
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        <Link href="/" className="transition-colors hover:text-primary text-foreground/70 hover:font-semibold">
                            Home
                        </Link>
                        <Link href="/documents" className="transition-colors hover:text-primary text-foreground/70 hover:font-semibold">
                            View PDF
                        </Link>
                        <Link href="/chat" className="transition-colors hover:text-primary text-foreground/70 hover:font-semibold flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-blue-500" />
                            AI Chat
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-primary text-foreground/70 hover:font-semibold outline-none data-[state=open]:text-primary">
                                Tools <ChevronDown className="h-3 w-3" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href="/tools/merge" className="cursor-pointer">Merge PDF</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/tools/split" className="cursor-pointer">Split PDF</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/tools/compress" className="cursor-pointer">Compress PDF</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/tools/edit" className="cursor-pointer">Edit PDF</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/tools/ocr" className="cursor-pointer">OCR (Image to Text)</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="/about" className="transition-colors hover:text-primary text-foreground/70 hover:font-semibold">
                            About the Developer
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="https://github.com/alihashmi2288" target="_blank" rel="noreferrer" className="hidden sm:block">
                        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                            <Github className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </div>
                    </Link>
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
