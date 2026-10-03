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
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolCategories = [
    {
        title: "Workspace",
        items: [
            { href: "/documents", label: "View & Manage", icon: FileText, badge: "Core" },
            { href: "/chat", label: "AI Document Chat", icon: MessageSquare, badge: "AI" },
        ]
    },
    {
        title: "PDF Engineering",
        items: [
            { href: "/tools/merge", label: "Merge Documents", icon: Combine },
            { href: "/tools/split", label: "Split Pages", icon: Scissors },
            { href: "/tools/compress", label: "Compress Size", icon: Minimize2 },
            { href: "/tools/edit", label: "Smart Editor", icon: SlidersHorizontal },
            { href: "/tools/ocr", label: "OCR Text Extraction", icon: ScanText, badge: "Vision" },
        ]
    },
    {
        title: "Document Converters",
        items: [
            { href: "/tools/image-to-pdf", label: "Images to PDF", icon: ImagePlus },
            { href: "/tools/docx-to-pdf", label: "Word (.docx) to PDF", icon: FileText },
            { href: "/tools/excel-to-pdf", label: "Excel (.xlsx) to PDF", icon: FileSpreadsheet },
            { href: "/tools/csv-to-pdf", label: "CSV to Table PDF", icon: FileSpreadsheet },
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
            <div className="space-y-5 sticky top-20">
                {/* Search Filter */}
                <div className="relative px-2">
                    <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-secondary/50 border border-border/60 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    />
                </div>

                {/* Categorized Nav Lists */}
                <div className="space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto subtle-scrollbar pr-1">
                    {filteredCategories.map((category) => (
                        <div key={category.title} className="space-y-1.5">
                            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
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
                                                "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all group",
                                                isActive
                                                    ? "bg-foreground text-background font-semibold shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-[0.98]"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Icon className={cn(
                                                    "h-4 w-4 shrink-0 transition-colors",
                                                    isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                                                )} />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={cn(
                                                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono uppercase font-semibold",
                                                    isActive 
                                                        ? "bg-background/20 text-background" 
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
                <div className="px-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/75">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Client-side sandbox. Zero file uploads.</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
