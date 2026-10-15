'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    FileText, 
    MessageSquare, 
    Scissors, 
    Combine, 
    ScanText, 
    Minimize2, 
    ImagePlus, 
    FileSpreadsheet, 
    FileCode, 
    Search,
    SlidersHorizontal,
    Sparkles,
    ShieldCheck,
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
    Presentation,
    Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolCategories = [
    {
        title: "AI Superpowers",
        items: [
            { href: "/chat/workspace", label: "Multi-PDF Workspace", icon: FolderGit2, badge: "Popular" },
            { href: "/tools/contract-scanner", label: "Contract Redliner", icon: Scale, badge: "New" },
            { href: "/tools/invoice-extractor", label: "Invoice Extractor", icon: ReceiptText, badge: "New" },
            { href: "/tools/translate", label: "Document Translator", icon: Languages, badge: "New" },
            { href: "/tools/study-ai", label: "Flashcards & Quiz", icon: GraduationCap, badge: "New" },
            { href: "/chat", label: "AI Document Chat", icon: MessageSquare, badge: "AI" },
        ]
    },
    {
        title: "Sign & Security",
        items: [
            { href: "/tools/sign", label: "e-Sign PDF", icon: PenTool, badge: "Hot" },
            { href: "/tools/protect", label: "Protect PDF (AES-256)", icon: Lock },
            { href: "/tools/unlock", label: "Unlock PDF", icon: Unlock },
            { href: "/tools/form-filler", label: "Fill PDF Forms", icon: FileEdit },
        ]
    },
    {
        title: "Convert From PDF",
        items: [
            { href: "/tools/pdf-to-docx", label: "PDF to Word (.docx)", icon: FileText, badge: "Top" },
            { href: "/tools/pdf-to-xlsx", label: "PDF to Excel (.xlsx)", icon: FileSpreadsheet, badge: "Top" },
            { href: "/tools/pdf-to-pptx", label: "PDF to PowerPoint", icon: Presentation },
            { href: "/tools/pdf-to-images", label: "PDF to JPG & PNG", icon: ImageIcon, badge: "ZIP" },
        ]
    },
    {
        title: "Page Organization",
        items: [
            { href: "/tools/rotate", label: "Rotate Pages", icon: RotateCw },
            { href: "/tools/crop", label: "Crop PDF Margins", icon: Crop },
            { href: "/tools/page-numbers", label: "Add Page Numbers", icon: Hash },
            { href: "/tools/watermark", label: "Custom Watermarks", icon: Stamp },
            { href: "/tools/merge", label: "Merge Documents", icon: Combine },
            { href: "/tools/split", label: "Split Pages", icon: Scissors },
            { href: "/tools/compress", label: "Compress File Size", icon: Minimize2 },
            { href: "/tools/edit", label: "Smart Editor", icon: SlidersHorizontal },
            { href: "/tools/ocr", label: "OCR Text Scanner", icon: ScanText },
        ]
    },
    {
        title: "Convert To PDF",
        items: [
            { href: "/tools/image-to-pdf", label: "Photos to PDF", icon: ImagePlus },
            { href: "/tools/docx-to-pdf", label: "Word to PDF", icon: FileText },
            { href: "/tools/excel-to-pdf", label: "Excel to PDF", icon: FileSpreadsheet },
            { href: "/tools/csv-to-pdf", label: "CSV to PDF", icon: FileSpreadsheet },
            { href: "/tools/markdown-to-pdf", label: "Markdown to PDF", icon: FileCode },
        ]
    }
];

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCategories = toolCategories.map(category => ({
        ...category,
        items: category.items.filter(item => 
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    return (
        <aside className={cn("w-64 shrink-0 hidden md:block border-r border-border/60 py-6 pr-4", className)}>
            <div className="space-y-4 sticky top-18">
                {/* Search Filter */}
                <div className="relative px-2">
                    <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search all 24+ tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-secondary/50 border border-border/60 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    />
                </div>

                {/* Categorized Nav Lists */}
                <div className="space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto subtle-scrollbar pr-1">
                    {filteredCategories.map((category) => (
                        <div key={category.title} className="space-y-1">
                            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                {category.title}
                            </p>
                            <div className="space-y-0.5">
                                {category.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md transition-all group",
                                                isActive
                                                    ? "bg-foreground text-background font-semibold shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-[0.98]"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Icon className={cn(
                                                    "h-3.5 w-3.5 shrink-0 transition-colors",
                                                    isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                                                )} />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={cn(
                                                    "text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase font-semibold",
                                                    isActive 
                                                        ? "bg-background/20 text-background" 
                                                        : item.badge === 'New' || item.badge === 'Hot'
                                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                        : "bg-secondary text-muted-foreground border border-border/40"
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Privacy Local Footnote */}
                <div className="px-3 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/75">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Client-side sandbox. 100% Private.</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
