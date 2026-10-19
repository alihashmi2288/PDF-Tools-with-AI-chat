"use client";

import React, { useMemo, useState } from "react";
import { marked } from "marked";
import { Copy, Check, FileDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaperProseProps {
  content: string;
  className?: string;
  showActions?: boolean;
  onCitationClick?: (pageOrSection: string) => void;
  title?: string;
}

// Configure marked with sensible, safe defaults for document reading
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function PaperProse({
  content,
  className,
  showActions = true,
  onCitationClick,
  title,
}: PaperProseProps) {
  const [copied, setCopied] = useState(false);

  // Process markdown into HTML and transform citation tags [Page X...] into tactile paper badges
  const renderedHtml = useMemo(() => {
    if (!content) return "";
    try {
      let rawHtml = marked.parse(content) as string;

      // Transform citation patterns: [Page 3], [Page 4, §2], [Section 3.1], [Doc: ...]
      // into interactive / styled paper citation pills
      rawHtml = rawHtml.replace(
        /\[(Page\s+\d+(?:,\s*§[\w\d.]+)?|Section\s+[\d.]+|Doc:\s*[^\]]+)\]/gi,
        `<span class="paper-citation-pill" data-citation="$1">
          <svg class="h-3 w-3 inline mr-0.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
            <path d="M6 6h10"></path>
            <path d="M6 10h10"></path>
          </svg>
          $1
        </span>`
      );

      return rawHtml;
    } catch (e) {
      console.error("Markdown parsing error:", e);
      return content;
    }
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleExportMarkdown = () => {
    try {
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(title || "ai-document-synthesis").toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  return (
    <div className={cn("group/paper relative", className)}>
      {/* Optional Top Action Strip for long document answers */}
      {showActions && content.length > 80 && (
        <div className="absolute right-0 top-0 -mt-2 -mr-1 opacity-0 group-hover/paper:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-surface-2/90 backdrop-blur-xs border border-hairline px-1.5 py-0.5 rounded-[6px] shadow-xs z-10">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard" : "Copy text"}
            className="text-[11px] text-ink-subtle hover:text-ink flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-surface-3 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#16a34a]" />
                <span className="text-[10px] text-[#16a34a] font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            title="Download as Markdown file"
            className="text-[11px] text-ink-subtle hover:text-ink flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-surface-3 transition-colors cursor-pointer"
          >
            <FileDown className="h-3 w-3" />
            <span className="text-[10px]">Export</span>
          </button>
        </div>
      )}

      {/* Rendered Paper Prose Content */}
      <div
        className="paper-prose"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        onClick={(e) => {
          if (onCitationClick) {
            const target = (e.target as HTMLElement).closest(".paper-citation-pill");
            if (target) {
              const cite = target.getAttribute("data-citation");
              if (cite) onCitationClick(cite);
            }
          }
        }}
      />
    </div>
  );
}
