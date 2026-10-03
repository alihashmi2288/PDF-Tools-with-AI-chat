'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { usePDFContext } from "@/context/PDFContext";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import {
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Lock,
  Combine,
  Scissors,
  Minimize2,
  SlidersHorizontal,
  ScanText,
  ImagePlus,
  FileSpreadsheet,
  FileCode,
  Upload,
  CheckCircle2,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { setFile, setPdfText } = usePDFContext();
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setDroppedFile(file);

    if (file.type === "application/pdf") {
      setIsProcessing(true);
      try {
        setFile(file);
        const text = await extractTextFromPDF(file);
        setPdfText(text);
      } catch (err) {
        console.error("Text extraction notice:", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const clearDroppedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDroppedFile(null);
  };

  const routeToFileAction = (path: string) => {
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
    router.push(path);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Subtle architectural background texture */}
      <div className="absolute inset-0 -z-10 pointer-events-none architect-grid opacity-70" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-16">
        
        {/* Section 1: Hero & Command Station */}
        <section className="space-y-8 text-center max-w-3xl mx-auto">
          {/* Engineering Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-secondary/80 border border-border/70 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Client-Side Engine • Zero Cloud Logs</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Precision Document Studio & Local Intelligence
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Edit, merge, compress, extract text, and converse with documents entirely inside your browser sandbox. Instant execution with WebAssembly.
            </p>
          </div>

          {/* Interactive Omni-Dropzone */}
          <div className="pt-2">
            <div
              {...getRootProps()}
              className={cn(
                "relative group rounded-xl border transition-all duration-200 p-6 sm:p-8 cursor-pointer text-left bg-card/60 backdrop-blur-md shadow-xs",
                isDragActive
                  ? "border-foreground bg-accent/30 ring-2 ring-foreground/10"
                  : "border-border/80 hover:border-foreground/40 hover:bg-card/90"
              )}
            >
              <input {...getInputProps()} />

              {!droppedFile ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/60 group-hover:scale-105 transition-transform">
                      <Upload className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-foreground">
                        Drop any document here, or <span className="underline decoration-border underline-offset-4">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Supports PDF, Word (.docx), Excel (.xlsx), CSV, Markdown, and Images
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-secondary/80 border border-border/50">
                      WASM Ready
                    </span>
                    <Button size="sm" variant="default" className="pointer-events-none text-xs h-8">
                      Select File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/60">
                        <FileText className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground truncate max-w-xs sm:max-w-md">
                          {droppedFile.name}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground tabular-nums">
                          {formatFileSize(droppedFile.size)} • {droppedFile.type || "Document"}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={clearDroppedFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Contextual Action Shelf */}
                  <div className="pt-2 border-t border-border/50 flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground self-center mr-1">Direct Actions:</span>
                    
                    {droppedFile.type === "application/pdf" ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 text-xs gap-1.5"
                          onClick={() => routeToFileAction("/chat")}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                          Chat with AI
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 text-xs gap-1.5"
                          onClick={() => routeToFileAction("/documents")}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View & Annotate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 text-xs gap-1.5"
                          onClick={() => routeToFileAction("/tools/compress")}
                        >
                          <Minimize2 className="h-3.5 w-3.5" />
                          Compress
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 text-xs gap-1.5"
                          onClick={() => routeToFileAction("/tools/split")}
                        >
                          <Scissors className="h-3.5 w-3.5" />
                          Split
                        </Button>
                      </>
                    ) : droppedFile.name.endsWith(".docx") ? (
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="h-8 text-xs gap-1.5"
                        onClick={() => router.push("/tools/docx-to-pdf")}
                      >
                        Convert DOCX to PDF
                      </Button>
                    ) : droppedFile.name.endsWith(".xlsx") ? (
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="h-8 text-xs gap-1.5"
                        onClick={() => router.push("/tools/excel-to-pdf")}
                      >
                        Convert Excel to PDF
                      </Button>
                    ) : droppedFile.name.endsWith(".csv") ? (
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="h-8 text-xs gap-1.5"
                        onClick={() => router.push("/tools/csv-to-pdf")}
                      >
                        Convert CSV to PDF Table
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="h-8 text-xs gap-1.5"
                        onClick={() => router.push("/tools/ocr")}
                      >
                        Scan with OCR
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Structured Workspace Bento Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Document Tool Suites
              </h2>
              <p className="text-xs text-muted-foreground">
                Modular instruments engineered for reliability and high throughput
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              10 Specialized Engines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Bento Tile 1: AI Chat Assistant (Span 7) */}
            <div className="md:col-span-7 rounded-xl border border-border/70 bg-card p-6 flex flex-col justify-between group hover:border-foreground/30 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono uppercase font-semibold text-blue-500 tracking-wider">
                      Intelligence
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                    Gemini API
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    Conversational PDF Intelligence
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ask questions, verify contractual clauses, extract structured data, or summarize complex technical papers directly against extracted document text.
                  </p>
                </div>

                {/* Micro prompt chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Summarize key findings", "Audit liability terms", "Extract tables to Markdown"].map((chip) => (
                    <span key={chip} className="text-[11px] px-2 py-0.8 rounded-md bg-secondary/70 text-muted-foreground border border-border/40 font-mono">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Interactive chat & memory</span>
                <Link href="/chat">
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 group-hover:translate-x-0.5 transition-transform">
                    Launch Assistant <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bento Tile 2: OCR Scanner (Span 5) */}
            <div className="md:col-span-5 rounded-xl border border-border/70 bg-card p-6 flex flex-col justify-between group hover:border-foreground/30 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                      <ScanText className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono uppercase font-semibold text-emerald-500 tracking-wider">
                      Optical Vision
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                    Tesseract.js
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    OCR Text Extraction
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Digitize scanned invoices, handwritten notes, and image-based PDFs into clean selectable text with zero server roundtrips.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/40 font-mono text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Client-side neural OCR</span>
                  <span className="text-emerald-500 font-semibold">100% Private</span>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Image to text engine</span>
                <Link href="/tools/ocr">
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open OCR <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bento Tile 3: Core PDF Manipulators (Span 6) */}
            <div className="md:col-span-6 rounded-xl border border-border/70 bg-card p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    PDF Manipulation Suite
                  </h3>
                  <p className="text-xs text-muted-foreground">High-performance page & byte editing</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                  pdf-lib
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/tools/merge" className="p-3 rounded-lg border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <Combine className="h-4 w-4 text-foreground" />
                    <span className="text-xs font-semibold text-foreground">Merge PDFs</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Combine documents with drag-and-drop reordering.
                  </p>
                </Link>

                <Link href="/tools/split" className="p-3 rounded-lg border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <Scissors className="h-4 w-4 text-foreground" />
                    <span className="text-xs font-semibold text-foreground">Split Pages</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Extract ranges, odd/even pages, or single slices.
                  </p>
                </Link>

                <Link href="/tools/compress" className="p-3 rounded-lg border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <Minimize2 className="h-4 w-4 text-foreground" />
                    <span className="text-xs font-semibold text-foreground">Compress</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Clean redundant streams to optimize file size.
                  </p>
                </Link>

                <Link href="/tools/edit" className="p-3 rounded-lg border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <SlidersHorizontal className="h-4 w-4 text-foreground" />
                    <span className="text-xs font-semibold text-foreground">Smart Editor</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Annotate, draw, redact, and insert text directly.
                  </p>
                </Link>
              </div>
            </div>

            {/* Bento Tile 4: Document Converters (Span 6) */}
            <div className="md:col-span-6 rounded-xl border border-border/70 bg-card p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Universal Converters
                  </h3>
                  <p className="text-xs text-muted-foreground">Office documents, data tables & code to PDF</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                  jsPDF • Mammoth
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Link href="/tools/docx-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileText className="h-4 w-4 text-blue-500 mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Word (.docx)</p>
                  <p className="text-[10px] text-muted-foreground">To styled PDF</p>
                </Link>

                <Link href="/tools/excel-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500 mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Excel (.xlsx)</p>
                  <p className="text-[10px] text-muted-foreground">Sheet to PDF</p>
                </Link>

                <Link href="/tools/csv-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileSpreadsheet className="h-4 w-4 text-amber-500 mb-1.5" />
                  <p className="text-xs font-medium text-foreground">CSV Table</p>
                  <p className="text-[10px] text-muted-foreground">Data formatting</p>
                </Link>

                <Link href="/tools/image-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <ImagePlus className="h-4 w-4 text-purple-500 mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Images</p>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP</p>
                </Link>

                <Link href="/tools/markdown-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileCode className="h-4 w-4 text-cyan-500 mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Markdown (.md)</p>
                  <p className="text-[10px] text-muted-foreground">Formatted docs</p>
                </Link>

                <Link href="/documents" className="p-2.5 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <Zap className="h-4 w-4 text-rose-500 mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Studio View</p>
                  <p className="text-[10px] text-muted-foreground">Integrated hub</p>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Section 3: Privacy & Security Architecture Strip */}
        <section className="rounded-xl border border-border/70 bg-card/60 p-6 md:p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Lock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Zero Cloud Ingestion
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your contracts, invoices, and sensitive documents never touch a third-party server. All byte operations run in your local memory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  WebAssembly Acceleration
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Engineered with Mozilla PDF.js and pdf-lib WebAssembly binaries for near-instant rendering and page operations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Direct AI Integration
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only the extracted text of the specific query you submit is processed through Google Gemini, maintaining strict audit boundaries.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
