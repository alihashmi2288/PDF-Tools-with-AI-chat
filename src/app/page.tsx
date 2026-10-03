'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { usePDFContext } from "@/context/PDFContext";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
  Zap,
  CornerDownRight,
  Eye,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { setFile, setPdfText } = usePDFContext();
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState<"drop" | "sample">("drop");
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);

  const samplePrompts = [
    {
      query: "Summarize the key compliance risks in section 4",
      response: "Identified 2 primary liabilities: strict GDPR data retention limits (Art. 17) and absence of a localized fallback processor for UK cross-border transfers."
    },
    {
      query: "Extract all financial deadlines and payment milestones",
      response: "Milestone 1 due October 15, 2026 ($45,000 net 30). Final retention release scheduled 90 days post-audit signoff on January 15, 2027."
    },
    {
      query: "Generate a bulleted executive briefing",
      response: "• 38-page technical specification consolidated into 4 core deliverables\n• Total allocated budget: $120,000 with 15% contingency\n• SLA guarantees 99.95% client-side uptime."
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleLoadedFile = async (file: File) => {
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

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    await handleLoadedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const loadSampleDocument = async () => {
    setIsProcessing(true);
    try {
      // Generate a realistic client-side sample PDF using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      page.drawText("EXECUTIVE BRIEFING & SYSTEM SPECIFICATION", {
        x: 50,
        y: 780,
        size: 16,
        font: fontBold,
        color: rgb(0.12, 0.14, 0.18),
      });

      page.drawText("Document ID: SPEC-2026-V2 | Status: Approved Client-Side Architecture", {
        x: 50,
        y: 755,
        size: 9,
        font: font,
        color: rgb(0.45, 0.48, 0.55),
      });

      const sampleLines = [
        "1. OVERVIEW & SCOPE",
        "This document describes the high-precision browser-sandboxed document engineering platform.",
        "All cryptographic operations, byte manipulation, and page rendering execute in client memory.",
        "",
        "2. PERFORMANCE & SECURITY SLA",
        "• Data Ingestion: 0 bytes uploaded to remote cloud infrastructure.",
        "• WASM Pipeline: Mozilla PDF.js & pdf-lib compile directly in user's browser runtime.",
        "• Memory Footprint: Garbage-collected upon session closure with zero local caching.",
        "",
        "3. COMPLIANCE & AUDIT",
        "Audit completed on October 2026 verifying zero telemetry leakage.",
        "All document transforms retain strict fidelity and vector font embeddings."
      ];

      let yPos = 710;
      for (const line of sampleLines) {
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") ? 11 : 10,
          font: line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") ? fontBold : font,
          color: rgb(0.15, 0.16, 0.2),
        });
        yPos -= 22;
      }

      const pdfBytes = await pdfDoc.save();
      const sampleFile = new File([pdfBytes as any], "Architecture-Briefing-Spec.pdf", { type: "application/pdf" });

      await handleLoadedFile(sampleFile);
    } catch (e) {
      console.error("Failed to generate sample PDF:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearDroppedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDroppedFile(null);
    setFile(null);
    setPdfText("");
  };

  const routeToFileAction = (path: string) => {
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
    router.push(path);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Background Architectural Grid with Subtle Depth */}
      <div className="absolute inset-0 -z-10 pointer-events-none architect-grid opacity-60" />
      
      {/* Soft Ambient Radial Sheen (subtle monochromatic glow, zero purple slop) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[350px] bg-foreground/[0.025] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-14 space-y-16">
        
        {/* ========================================================================= */}
        {/* HERO SECTION: Heading & Status */}
        {/* ========================================================================= */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          {/* Engineering Pill (HCI System Status Visibility) */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-secondary/80 border border-border/70 text-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>WASM Runtime Active</span>
            <span className="text-border">•</span>
            <span className="text-muted-foreground">100% In-Browser Sandbox</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Precision Document Studio & Intelligence
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Edit, merge, compress, extract text, and converse with documents entirely inside your browser. No files are uploaded to any server.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* THE LIVING DOCUMENT CANVAS STAGE (Double-Bezel Hardware Architecture) */}
        {/* ========================================================================= */}
        <section className="max-w-4xl mx-auto">
          {/* Outer Shell (Doppelrand Hardware Enclosure) */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-foreground/[0.03] border border-border/70 shadow-lg backdrop-blur-md transition-all">
            {/* Inner Core */}
            <div className="rounded-xl bg-card border border-border/60 p-5 sm:p-7 space-y-5">
              
              {/* Canvas Header Bar with Document Geometry */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Interactive Document Canvas</span>
                  <span className="text-muted-foreground/60">/</span>
                  <span className="text-muted-foreground text-[11px]">A4 • 595 × 842 pt</span>
                </div>

                {/* Canvas Mode Switcher */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-secondary/60 p-1 rounded-lg border border-border/50">
                  <button
                    type="button"
                    onClick={() => setActiveCanvasTab("drop")}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md font-medium transition-all",
                      activeCanvasTab === "drop"
                        ? "bg-foreground text-background shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Load Document
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCanvasTab("sample");
                      if (!droppedFile) loadSampleDocument();
                    }}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1",
                      activeCanvasTab === "sample"
                        ? "bg-foreground text-background shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Try Sample PDF</span>
                  </button>
                </div>
              </div>

              {/* Canvas Viewport Content */}
              {!droppedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative group rounded-xl border border-dashed transition-all duration-200 p-8 sm:p-12 cursor-pointer text-center bg-secondary/20 flex flex-col items-center justify-center min-h-[220px]",
                    isDragActive
                      ? "border-foreground bg-accent/40 ring-2 ring-foreground/10"
                      : "border-border/80 hover:border-foreground/40 hover:bg-secondary/40"
                  )}
                >
                  <input {...getInputProps()} />

                  {/* Simulated Floating Paper Sheet on Canvas */}
                  <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-14 h-18 rounded-md bg-secondary/90 border border-border/80 shadow-xs flex flex-col p-2 space-y-1.5 animate-float">
                      <div className="w-6 h-1 rounded-full bg-foreground/20" />
                      <div className="w-full h-1 rounded-full bg-foreground/15" />
                      <div className="w-8 h-1 rounded-full bg-foreground/15" />
                      <div className="w-full h-1 rounded-full bg-foreground/15" />
                    </div>
                  </div>

                  <div className="space-y-1 pointer-events-none">
                    <p className="font-semibold text-sm sm:text-base text-foreground">
                      Drop any document onto the canvas, or <span className="underline decoration-border underline-offset-4">browse files</span>
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Supports PDF, Word (.docx), Excel (.xlsx), CSV tables, Markdown (.md), and Scanned Images
                    </p>
                  </div>

                  {/* Quick Zero-Friction Test Action */}
                  <div className="pt-4 flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Don&apos;t have a file ready?</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSampleDocument();
                      }}
                      className="text-xs font-medium text-foreground underline hover:text-blue-500 transition-colors flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3 text-amber-500" />
                      Load Instant Demo PDF
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Loaded Canvas State */
                <div className="space-y-5 p-4 rounded-xl border border-border/70 bg-secondary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Document Sheet Thumbnail with Realistic Paper Edge */}
                      <div className="h-12 w-10 rounded-md bg-card border border-border/80 shadow-xs flex flex-col justify-between p-1.5 shrink-0">
                        <div className="w-4 h-1 rounded-full bg-foreground/20" />
                        <div className="space-y-1">
                          <div className="w-full h-0.5 rounded-full bg-foreground/15" />
                          <div className="w-full h-0.5 rounded-full bg-foreground/15" />
                        </div>
                        <div className="w-5 h-1 rounded-full bg-emerald-500/40" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-foreground truncate max-w-xs sm:max-w-md">
                            {droppedFile.name}
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                            Active
                          </span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground tabular-nums mt-0.5">
                          {formatFileSize(droppedFile.size)} • {droppedFile.type || "Document"} • Stored in browser RAM
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto"
                      onClick={clearDroppedFile}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Release Document
                    </Button>
                  </div>

                  {/* Immediate Action Shelf */}
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span>Available Actions for this Document:</span>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2"
                        onClick={() => routeToFileAction("/chat")}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">Chat with AI</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2"
                        onClick={() => routeToFileAction("/documents")}
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">View & Annotate</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2"
                        onClick={() => routeToFileAction("/tools/compress")}
                      >
                        <Minimize2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Compress Size</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2"
                        onClick={() => routeToFileAction("/tools/split")}
                      >
                        <Scissors className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Split Pages</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Local Privacy & Speed Micro-Ticker */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-muted-foreground border-t border-border/40 font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Zero Cloud Ingestion: All byte manipulation executes locally</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>WASM: Ready</span>
                  <span className="text-border">•</span>
                  <span>Tesseract OCR: Idle</span>
                  <span className="text-border">•</span>
                  <span>pdf-lib: Active</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LIVING BENTO SHELVES: Visual Micro-Canvases Instead of Static Text */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Document Tool Suites
              </h2>
              <p className="text-xs text-muted-foreground">
                Interactive instruments engineered for direct browser manipulation
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              10 Specialized Engines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Bento Tile 1: AI Chat Assistant with Live Interactive Prompt Simulator (Span 7) */}
            <div className="md:col-span-7 rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between group hover:border-foreground/30 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono uppercase font-semibold text-blue-500 tracking-wider">
                      Document Intelligence
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                    Gemini API
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    Conversational PDF Intelligence
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Test how the AI interrogates loaded documents. Click any prompt below to view simulated context extraction:
                  </p>
                </div>

                {/* Interactive Simulated Terminal Canvas */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 space-y-3 font-mono text-xs">
                  {/* Prompt Selector Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {samplePrompts.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPromptIndex(idx)}
                        className={cn(
                          "text-[11px] px-2.5 py-1 rounded-md transition-all text-left truncate max-w-[200px] border",
                          selectedPromptIndex === idx
                            ? "bg-foreground text-background font-semibold border-foreground"
                            : "bg-background/80 text-muted-foreground border-border/60 hover:text-foreground hover:bg-background"
                        )}
                      >
                        Prompt #{idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Simulated Question & Output Stream */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-2 text-foreground font-semibold">
                      <span className="text-blue-500 shrink-0">Q:</span>
                      <span>{samplePrompts[selectedPromptIndex].query}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground text-[11px] bg-background/60 p-2.5 rounded-lg border border-border/40 leading-relaxed whitespace-pre-wrap">
                      <span className="text-emerald-500 font-bold shrink-0">AI:</span>
                      <span>{samplePrompts[selectedPromptIndex].response}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Full contextual session support</span>
                <Link href="/chat">
                  <Button size="sm" variant="default" className="h-8 text-xs gap-1.5 group-hover:translate-x-0.5 transition-transform">
                    Launch AI Chat <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bento Tile 2: OCR Scanner with Animated Laser Scan Beam (Span 5) */}
            <div className="md:col-span-5 rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between group hover:border-foreground/30 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                      <ScanText className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono uppercase font-semibold text-emerald-500 tracking-wider">
                      Optical Vision
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                    Tesseract.js
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    OCR Neural Text Scanner
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Digitize flattened invoices and scans directly into searchable text in real time.
                  </p>
                </div>

                {/* Visual Micro-Canvas: Animated Laser Scanner Ray over Document Sheet */}
                <div className="relative h-32 rounded-xl bg-secondary/50 border border-border/60 p-3 overflow-hidden flex flex-col justify-between font-mono text-[11px]">
                  {/* Subtle Scanning Laser Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] pointer-events-none animate-scanner" />

                  <div className="space-y-1.5 opacity-60">
                    <div className="w-16 h-2 rounded bg-foreground/30" />
                    <div className="w-full h-1.5 rounded bg-foreground/20" />
                    <div className="w-3/4 h-1.5 rounded bg-foreground/20" />
                    <div className="w-5/6 h-1.5 rounded bg-foreground/20" />
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Character Matrix
                    </span>
                    <span className="text-muted-foreground">Confidence: 99.4%</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">PNG, JPG, BMP to text</span>
                <Link href="/tools/ocr">
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open OCR <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bento Tile 3: Core PDF Manipulators (Span 6) */}
            <div className="md:col-span-6 rounded-2xl border border-border/70 bg-card p-6 space-y-5 shadow-xs">
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

              <div className="grid grid-cols-2 gap-3">
                
                {/* Micro-Canvas: Merge with Visual Paper Stacks */}
                <Link 
                  href="/tools/merge" 
                  className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Combine className="h-4 w-4 text-foreground" />
                        <span className="text-xs font-semibold text-foreground">Merge PDFs</span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Combine documents with drag-and-drop sequence ordering.
                    </p>
                  </div>

                  {/* Visual Paper Stacks Metaphor */}
                  <div className="pt-3 flex items-center gap-1.5">
                    <span className="h-5 px-1.5 rounded bg-background border border-border/60 text-[10px] font-mono text-muted-foreground flex items-center">Doc 1</span>
                    <span className="text-xs text-muted-foreground">+</span>
                    <span className="h-5 px-1.5 rounded bg-background border border-border/60 text-[10px] font-mono text-muted-foreground flex items-center">Doc 2</span>
                    <span className="text-xs text-muted-foreground">=</span>
                    <span className="h-5 px-1.5 rounded bg-foreground text-background text-[10px] font-mono font-bold flex items-center">Unified</span>
                  </div>
                </Link>

                {/* Micro-Canvas: Split with Filmstrip Metaphor */}
                <Link 
                  href="/tools/split" 
                  className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-foreground" />
                        <span className="text-xs font-semibold text-foreground">Split Pages</span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Extract odd/even slices or custom page ranges.
                    </p>
                  </div>

                  {/* Visual Filmstrip Slices */}
                  <div className="pt-3 flex items-center gap-1">
                    <span className="h-5 w-5 rounded bg-background border border-border/60 text-[9px] font-mono text-muted-foreground flex items-center justify-center">p1</span>
                    <span className="h-5 w-5 rounded bg-blue-500/20 border border-blue-500/40 text-[9px] font-mono text-blue-500 font-bold flex items-center justify-center">p2</span>
                    <span className="h-5 w-5 rounded bg-blue-500/20 border border-blue-500/40 text-[9px] font-mono text-blue-500 font-bold flex items-center justify-center">p3</span>
                    <span className="h-5 w-5 rounded bg-background border border-border/60 text-[9px] font-mono text-muted-foreground flex items-center justify-center">p4</span>
                  </div>
                </Link>

                {/* Micro-Canvas: Compress with Space Reduction Gauge */}
                <Link 
                  href="/tools/compress" 
                  className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Minimize2 className="h-4 w-4 text-foreground" />
                        <span className="text-xs font-semibold text-foreground">Compress</span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Purge redundant streams for fast transmission.
                    </p>
                  </div>

                  {/* Visual Space Reduction Meter */}
                  <div className="pt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground line-through">18.4 MB</span>
                      <span className="text-emerald-500 font-bold">3.1 MB (-83%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full w-2/12 bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                </Link>

                {/* Micro-Canvas: Smart Editor */}
                <Link 
                  href="/tools/edit" 
                  className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-foreground/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-foreground" />
                        <span className="text-xs font-semibold text-foreground">Smart Editor</span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Annotate, redact sensitive areas, and stamp text.
                    </p>
                  </div>

                  {/* Redaction Pill Indicator */}
                  <div className="pt-3 flex items-center gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-foreground text-background font-bold">[REDACTED]</span>
                    <span className="text-muted-foreground">In-Canvas</span>
                  </div>
                </Link>

              </div>
            </div>

            {/* Bento Tile 4: Universal Document Converters (Span 6) */}
            <div className="md:col-span-6 rounded-2xl border border-border/70 bg-card p-6 space-y-5 shadow-xs">
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <Link href="/tools/docx-to-pdf" className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileText className="h-4 w-4 text-blue-500 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Word (.docx)</p>
                  <p className="text-[10px] text-muted-foreground">To styled PDF</p>
                </Link>

                <Link href="/tools/excel-to-pdf" className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Excel (.xlsx)</p>
                  <p className="text-[10px] text-muted-foreground">Sheet to PDF</p>
                </Link>

                <Link href="/tools/csv-to-pdf" className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileSpreadsheet className="h-4 w-4 text-amber-500 mb-2" />
                  <p className="text-xs font-semibold text-foreground">CSV Table</p>
                  <p className="text-[10px] text-muted-foreground">Data formatting</p>
                </Link>

                <Link href="/tools/image-to-pdf" className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <ImagePlus className="h-4 w-4 text-purple-500 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Images</p>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP</p>
                </Link>

                <Link href="/tools/markdown-to-pdf" className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <FileCode className="h-4 w-4 text-cyan-500 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Markdown (.md)</p>
                  <p className="text-[10px] text-muted-foreground">Formatted docs</p>
                </Link>

                <Link href="/documents" className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 transition-all group">
                  <Zap className="h-4 w-4 text-rose-500 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Studio View</p>
                  <p className="text-[10px] text-muted-foreground">Integrated hub</p>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRIVACY & SECURITY ARCHITECTURE STRIP */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-border/70 bg-card/60 p-6 md:p-8 backdrop-blur-sm shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Lock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Zero Cloud Ingestion
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your contracts, invoices, and sensitive documents never touch a third-party server. All byte operations execute in local RAM.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  WebAssembly Engine
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Engineered with Mozilla PDF.js and pdf-lib WebAssembly binaries for near-instant rendering and local page operations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Strict Audit Boundaries
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only the extracted text of the specific query you submit is processed through Google Gemini, maintaining strict privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
