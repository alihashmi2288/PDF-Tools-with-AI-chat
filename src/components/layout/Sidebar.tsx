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
    Code
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
            { href: "/tools/flatten-pdf", label: "Flatten PDF (Lock)", icon: Lock, badge: "New" },
            { href: "/tools/protect", label: "Protect PDF (AES-256)", icon: Lock },
            { href: "/tools/unlock", label: "Unlock PDF", icon: Unlock },
            { href: "/tools/form-filler", label: "Fill PDF Forms", icon: FileEdit },
            { href: "/tools/pdf-to-pdfa", label: "PDF/A Archival (ISO)", icon: Award, badge: "ISO" },
        ]
    },
    {
        title: "Page Organization",
        items: [
            { href: "/tools/delete-pages", label: "Delete Pages", icon: Trash2, badge: "Hot" },
            { href: "/tools/rearrange-pages", label: "Rearrange Pages", icon: ArrowUpDown, badge: "D&D" },
            { href: "/tools/extract-pages", label: "Extract Pages", icon: Scissors, badge: "Fast" },
            { href: "/tools/grayscale-pdf", label: "Grayscale / Ink-Saver", icon: Moon, badge: "Save" },
            { href: "/tools/resize-pages", label: "Resize Page Dimensions", icon: Maximize2 },
            { href: "/tools/header-footer", label: "Header & Footer Stamp", icon: Tag },
            { href: "/tools/split-by-bookmarks", label: "Split by Bookmarks", icon: Bookmark, badge: "New" },
            { href: "/tools/rotate", label: "Rotate Pages", icon: RotateCw },
            { href: "/tools/crop", label: "Crop PDF Margins", icon: Crop },
            { href: "/tools/page-numbers", label: "Add Page Numbers", icon: Hash },
            { href: "/tools/watermark", label: "Custom Watermarks", icon: Stamp },
            { href: "/tools/merge", label: "Merge Documents", icon: Combine },
            { href: "/tools/split", label: "Split Pages", icon: Scissors },
            { href: "/tools/compress", label: "Compress File Size", icon: Minimize2 },
            { href: "/tools/view", label: "PDF Reader & AI", icon: BookOpen },
            { href: "/tools/edit", label: "PDF Editor", icon: SlidersHorizontal },
            { href: "/tools/ocr", label: "OCR Text Scanner", icon: ScanText },
        ]
    },
    {
        title: "Convert From PDF",
        items: [
            { href: "/tools/pdf-to-txt", label: "PDF to TXT (Plain Text)", icon: FileText, badge: "New" },
            { href: "/tools/pdf-to-html", label: "PDF to HTML Webpage", icon: Globe, badge: "New" },
            { href: "/tools/pdf-to-epub", label: "PDF to EPUB eBook", icon: Tablet, badge: "New" },
            { href: "/tools/svg-pdf", label: "PDF to SVG Vector", icon: Shapes, badge: "Vector" },
            { href: "/tools/pdf-to-docx", label: "PDF to Word (.docx)", icon: FileText, badge: "Top" },
            { href: "/tools/pdf-to-xlsx", label: "PDF to Excel (.xlsx)", icon: FileSpreadsheet, badge: "Top" },
            { href: "/tools/pdf-to-pptx", label: "PDF to PowerPoint", icon: Presentation },
            { href: "/tools/pdf-to-images", label: "PDF to JPG & PNG", icon: ImageIcon, badge: "ZIP" },
        ]
    },
    {
        title: "Convert To PDF",
        items: [
            { href: "/tools/html-to-pdf", label: "HTML to PDF", icon: Code, badge: "New" },
            { href: "/tools/pptx-to-pdf", label: "PowerPoint to PDF", icon: Presentation, badge: "New" },
            { href: "/tools/epub-to-pdf", label: "EPUB to PDF", icon: BookOpen, badge: "New" },
            { href: "/tools/svg-pdf", label: "SVG to PDF Vector", icon: Shapes, badge: "New" },
            { href: "/tools/json-to-pdf", label: "JSON/XML to PDF Report", icon: FileSpreadsheet, badge: "New" },
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
        <aside className={cn("w-64 shrink-0 hidden md:block border-r border-hairline py-6 pr-4", className)}>
            <div className="space-y-4 sticky top-18">
                {/* Search Filter with 8px radius */}
                <div className="relative px-2">
                    <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-subtle pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Filter tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8.5 pl-8 pr-3 text-xs rounded-[8px] bg-surface-1 border border-hairline text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                </div>

                {/* Categorized Nav Lists */}
                <div className="space-y-5 max-h-[calc(100vh-10rem)] overflow-y-auto subtle-scrollbar pr-1">
                    {filteredCategories.map((category) => (
                        <div key={category.title} className="space-y-1">
                            <p className="px-3 type-eyebrow text-[10px] text-ink-subtle uppercase tracking-[0.4px]">
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
                                                "flex items-center justify-between px-3 py-1.5 text-xs rounded-[8px] transition-all group",
                                                isActive
                                                    ? "bg-primary/10 text-primary dark:bg-primary/20 font-medium"
                                                    : "text-ink-subtle hover:text-ink hover:bg-surface-2"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Icon className={cn(
                                                    "h-3.5 w-3.5 shrink-0 transition-opacity",
                                                    isActive ? "text-primary" : "opacity-60 group-hover:opacity-100"
                                                )} />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={cn(
                                                    "type-mono-eyebrow text-[9px] px-1.5 py-0.5 rounded-[4px] border",
                                                    isActive 
                                                        ? "border-primary/30 text-primary bg-primary/10" 
                                                        : "border-hairline bg-surface-2 text-ink-muted"
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

                {/* Privacy Guarantee Footnote */}
                <div className="px-3 pt-3 border-t border-hairline">
                    <div className="flex items-center gap-2 type-mono-eyebrow text-[10px] text-ink-subtle">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] shrink-0" />
                        <span>100% Private • Stays on device</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
