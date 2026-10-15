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
  Eye,
  Layers,
  ArrowUpRight,
  GraduationCap,
  Briefcase,
  Store,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Check,
  FileCheck,
  PenTool,
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
  Presentation,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { setFile, setPdfText } = usePDFContext();
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [activePersona, setActivePersona] = useState<"students" | "professionals" | "business">("students");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Relatable, everyday sample questions & answers
  const samplePrompts = [
    {
      title: "Security Deposit",
      query: "How much is the security deposit and when do I get it back?",
      response: "The security deposit is $1,450 (equal to one month's rent). It is fully refundable within 21 days after move-out, provided there is no damage beyond normal wear and tear."
    },
    {
      title: "Pet Policy",
      query: "Are pets allowed in the apartment, and is there an extra fee?",
      response: "Yes! Small cats and dogs (under 40 lbs) are permitted with a $25/month pet fee. Up to two pets are allowed per unit."
    },
    {
      title: "Notice to Move Out",
      query: "How much advance notice is required to cancel or move out?",
      response: "A 30-day written notice is required before the end of the lease term if you do not plan to renew."
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

  // Generates a realistic, relatable rental agreement sample
  const loadSampleDocument = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      page.drawText("RESIDENTIAL LEASE AGREEMENT & SUMMARY", {
        x: 50,
        y: 780,
        size: 15,
        font: fontBold,
        color: rgb(0.12, 0.14, 0.18),
      });

      page.drawText("Property: 742 Evergreen Terrace, Apt 4B • Term: 12 Months", {
        x: 50,
        y: 755,
        size: 9.5,
        font: font,
        color: rgb(0.45, 0.48, 0.55),
      });

      const sampleLines = [
        "1. RENT & PAYMENT TERMS",
        "Monthly rent is $1,450, payable on the 1st calendar day of each month.",
        "A grace period of 5 business days applies before a $25 late fee is assessed.",
        "",
        "2. SECURITY DEPOSIT",
        "Tenant has paid a deposit of $1,450. The deposit will be returned within 21 days",
        "following inspection at move-out, minus any verified repair costs.",
        "",
        "3. PET POLICY & PERMITS",
        "Up to two small pets (cats or dogs under 40 lbs) are permitted.",
        "An additional monthly pet fee of $25 per animal is added to base rent.",
        "",
        "4. TERMINATION & RENEWAL",
        "Either party may terminate or request renewal with 30 days prior written notice."
      ];

      let yPos = 710;
      for (const line of sampleLines) {
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.") ? 11 : 10,
          font: line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.") ? fontBold : font,
          color: rgb(0.15, 0.16, 0.2),
        });
        yPos -= 22;
      }

      const pdfBytes = await pdfDoc.save();
      const sampleFile = new File([pdfBytes as any], "Rental-Agreement-Sample.pdf", { type: "application/pdf" });

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Do I need to create an account or pay to use this?",
      a: "No. PDF AI Master is completely free to use. There are no signups, no credit cards, no subscriptions, and no hidden file size limits."
    },
    {
      q: "Are my documents uploaded to a remote server?",
      a: "No. All core document operations—merging, splitting, compressing, viewing, and converting—run directly on your computer inside your web browser. Your private documents never touch our servers."
    },
    {
      q: "How does the AI chat work if my files are private?",
      a: "When you ask a question, the app reads the relevant text locally on your device and sends only the specific question and excerpt securely to Google Gemini to get your answer. Your full PDF file is never stored or uploaded."
    },
    {
      q: "Can I convert Word, Excel, or photos to PDF?",
      a: "Yes! You can convert Word documents (.docx), Excel spreadsheets (.xlsx), CSV data tables, Markdown notes (.md), and images (JPG, PNG, WebP) directly into cleanly formatted PDFs."
    }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Background Architectural Grid with Subtle Depth */}
      <div className="absolute inset-0 -z-10 pointer-events-none architect-grid opacity-50" />
      
      {/* Soft Ambient Radial Sheen */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-[650px] h-[300px] bg-foreground/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-14 space-y-20">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Human-Friendly, Zero Jargon, Immediate Value */}
        {/* ========================================================================= */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          {/* Trust & Privacy Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-secondary/80 border border-border/80 text-foreground shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Private on Your Device</span>
            <span className="text-border">•</span>
            <span className="text-muted-foreground">No accounts • No uploads</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
              Everything you need for PDFs. Fast, simple, and private.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Chat with your documents, merge pages, shrink file sizes, and convert files directly in your browser. Your files never leave your computer.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE INTERACTIVE DOCUMENT DROPZONE (Start Immediately) */}
        {/* ========================================================================= */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="p-1 sm:p-2 rounded-2xl bg-foreground/[0.03] border border-border/70 shadow-sm backdrop-blur-md">
            <div className="rounded-xl bg-card border border-border/60 p-5 sm:p-6 space-y-4">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <FileCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-foreground">Document Workspace</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-muted-foreground text-[11px]">Free &amp; confidential</span>
                </div>

                {!droppedFile && (
                  <button
                    type="button"
                    onClick={loadSampleDocument}
                    disabled={isProcessing}
                    className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors bg-secondary/70 hover:bg-secondary text-foreground flex items-center gap-1.5 border border-border/60 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Try Sample Document</span>
                  </button>
                )}
              </div>

              {/* Drop Area Content */}
              {!droppedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative group rounded-xl border-2 border-dashed transition-all duration-200 p-8 sm:p-10 cursor-pointer text-center bg-secondary/20 flex flex-col items-center justify-center min-h-[200px]",
                    isDragActive
                      ? "border-foreground bg-accent/40"
                      : "border-border/80 hover:border-foreground/40 hover:bg-secondary/40"
                  )}
                >
                  <input {...getInputProps()} />

                  <div className="w-12 h-14 rounded-md bg-secondary/80 border border-border/80 shadow-xs flex flex-col items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>

                  <div className="space-y-1 pointer-events-none">
                    <p className="font-semibold text-sm sm:text-base text-foreground">
                      Drop any document here, or <span className="underline decoration-border underline-offset-4">browse your files</span>
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Works with PDF, Word (.docx), Excel (.xlsx), CSV, Markdown, and Images
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Don&apos;t have a file ready?</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSampleDocument();
                      }}
                      className="text-xs font-semibold text-foreground underline hover:text-blue-500 transition-colors flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3 text-amber-500" />
                      Load a sample lease agreement
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Loaded File State */
                <div className="space-y-4 p-4 rounded-xl border border-border/70 bg-secondary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-8 rounded-md bg-card border border-border/80 shadow-xs flex flex-col justify-between p-1 shrink-0">
                        <div className="w-3 h-0.5 rounded-full bg-foreground/30" />
                        <div className="w-full h-0.5 rounded-full bg-foreground/20" />
                        <div className="w-4 h-0.5 rounded-full bg-emerald-500" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate max-w-xs sm:max-w-md">
                            {droppedFile.name}
                          </p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                            Ready
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                          {formatFileSize(droppedFile.size)} • Stored safely on your computer
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto cursor-pointer"
                      onClick={clearDroppedFile}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Remove File
                    </Button>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <span>Choose what to do with this file:</span>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2 cursor-pointer"
                        onClick={() => routeToFileAction("/chat")}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">Ask AI Questions</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2 cursor-pointer"
                        onClick={() => routeToFileAction("/documents")}
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">View &amp; Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2 cursor-pointer"
                        onClick={() => routeToFileAction("/tools/compress")}
                      >
                        <Minimize2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Shrink File Size</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs justify-start px-3 gap-2 cursor-pointer"
                        onClick={() => routeToFileAction("/tools/split")}
                      >
                        <Scissors className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Split Pages</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Reassurance Line */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-emerald-500" />
                  Your file stays private in your browser. Nothing is saved online.
                </span>
                <span className="hidden sm:inline">100% Free &amp; Private</span>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. TASK-ORIENTED TOOL GRID ("What would you like to do?") */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              What would you like to do?
            </h2>
            <p className="text-sm text-muted-foreground">
              24+ professional tools to organize, convert, sign, and analyze documents directly on your device.
            </p>
          </div>

          {/* Category A: High-Value AI Powerhouse */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-foreground">
                  AI Intelligence &amp; Multi-Document Workspace
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Advanced Gemini Analysis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Multi-PDF Workspace */}
              <Link
                href="/chat/workspace"
                className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60 hover:bg-blue-500/10 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30">
                      <FolderGit2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded">
                      Featured
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground group-hover:text-blue-500 transition-colors">
                      Multi-PDF Project Workspace
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Upload 5–20 documents into a project folder to ask cross-document synthesis queries with citations.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* AI Contract Redliner */}
              <Link
                href="/tools/contract-scanner"
                className="p-5 rounded-xl border border-border/70 bg-card hover:border-foreground/30 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
                      <Scale className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                      High Impact
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground group-hover:text-red-500 transition-colors">
                      Contract Redline &amp; Risk Scanner
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Compare two contract versions side-by-side to detect added liabilities, altered numbers, and trap clauses.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Scan contract</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* AI Invoice & Table Extractor */}
              <Link
                href="/tools/invoice-extractor"
                className="p-5 rounded-xl border border-border/70 bg-card hover:border-foreground/30 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <ReceiptText className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Finance
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground group-hover:text-emerald-500 transition-colors">
                      Invoice &amp; Table Extractor
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Batch-scan PDF invoices and receipts to extract structured line items and export directly to Excel.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Extract tables</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* AI Full-Document Translator */}
              <Link
                href="/tools/translate"
                className="p-5 rounded-xl border border-border/70 bg-card hover:border-foreground/30 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Languages className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground group-hover:text-cyan-500 transition-colors">
                      Document Translator (RTL Ready)
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Translate PDFs into Urdu, Arabic, Spanish, French, German, or Chinese with bilingual side-by-side view.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Translate document</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* AI Flashcard & Quiz Generator */}
              <Link
                href="/tools/study-ai"
                className="p-5 rounded-xl border border-border/70 bg-card hover:border-foreground/30 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                      Students
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground group-hover:text-violet-500 transition-colors">
                      Flashcards &amp; Quiz Generator
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Turn textbook chapters and lecture slides into interactive 3D flip cards, Anki decks, and graded quizzes.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Study materials</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* Single Document Chat */}
              <Link
                href="/chat"
                className="p-5 rounded-xl border border-border/70 bg-card hover:border-foreground/30 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground group-hover:text-blue-500 transition-colors">
                      Quick Q&amp;A &amp; Summarize
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Get rapid summaries, clear explanations, and specific answers from single loaded documents.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Start chatting</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Category B: Reverse Converters (Highest Global Search Demand) */}
          <div className="p-5 rounded-2xl border border-border/70 bg-secondary/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Convert PDF to Word, Excel, PowerPoint &amp; Images
                </h3>
                <p className="text-xs text-muted-foreground">
                  The highest-searched reverse converters — 100% private in your browser
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Zero Cloud Uploads</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/tools/pdf-to-docx"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-blue-500/50 hover:bg-secondary/30 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-blue-500 transition-colors">
                    PDF to Word (.docx)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Editable Word doc with headings</p>
                </div>
                <div className="pt-3 flex items-center text-[11px] font-semibold text-blue-500 gap-1">
                  <span>Convert</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                href="/tools/pdf-to-xlsx"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-secondary/30 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                    PDF to Excel (.xlsx)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Extract tables into spreadsheets</p>
                </div>
                <div className="pt-3 flex items-center text-[11px] font-semibold text-emerald-500 gap-1">
                  <span>Convert</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                href="/tools/pdf-to-pptx"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-orange-500/50 hover:bg-secondary/30 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                    <Presentation className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-orange-500 transition-colors">
                    PDF to PowerPoint
                  </h4>
                  <p className="text-[11px] text-muted-foreground">16:9 widescreen presentation slides</p>
                </div>
                <div className="pt-3 flex items-center text-[11px] font-semibold text-orange-500 gap-1">
                  <span>Convert</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                href="/tools/pdf-to-images"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-purple-500/50 hover:bg-secondary/30 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-purple-500 transition-colors">
                    PDF to JPG &amp; PNG
                  </h4>
                  <p className="text-[11px] text-muted-foreground">High DPI images + 1-click ZIP</p>
                </div>
                <div className="pt-3 flex items-center text-[11px] font-semibold text-purple-500 gap-1">
                  <span>Convert</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </div>
          </div>

          {/* Category C: Sign & Security */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Signatures &amp; Security Tools
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">AES-256 Encryption • Transparent Signatures</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/tools/sign"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <PenTool className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                    e-Sign PDF
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Draw, type, or upload transparent signatures, place date stamps, and sign documents.
                  </p>
                </div>
                <div className="pt-3 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 gap-1">
                  <span>Sign document</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              <Link
                href="/tools/protect"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                    Protect PDF (AES-256)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Encrypt PDFs with user passwords and restrict printing, copying, or modifying permissions.
                  </p>
                </div>
                <div className="pt-3 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 gap-1">
                  <span>Lock PDF</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              <Link
                href="/tools/unlock"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-amber-500/50 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Unlock className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-amber-500 transition-colors">
                    Unlock PDF
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Provide your password once to permanently strip password prompts and unlock restrictions.
                  </p>
                </div>
                <div className="pt-3 flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 gap-1">
                  <span>Remove password</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              <Link
                href="/tools/form-filler"
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-teal-500/50 hover:bg-secondary/20 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
                    <FileEdit className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-teal-500 transition-colors">
                    Interactive Form Filler
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Fill official AcroForm text fields, checkboxes, and select dropdowns, and flatten for submission.
                  </p>
                </div>
                <div className="pt-3 flex items-center text-xs font-medium text-teal-600 dark:text-teal-400 gap-1">
                  <span>Fill forms</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Category D: Page Organization & Stamping */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <Combine className="h-4 w-4 text-foreground" />
                <h3 className="text-sm font-bold text-foreground">
                  Page Organization &amp; Stamping
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Fast Browser Processing</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <Link href="/tools/rotate" className="p-3 rounded-xl border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col items-center text-center gap-2 group">
                <RotateCw className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">Rotate Pages</span>
              </Link>

              <Link href="/tools/crop" className="p-3 rounded-xl border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col items-center text-center gap-2 group">
                <Crop className="h-5 w-5 text-teal-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">Crop Margins</span>
              </Link>

              <Link href="/tools/page-numbers" className="p-3 rounded-xl border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col items-center text-center gap-2 group">
                <Hash className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">Page Numbers</span>
              </Link>

              <Link href="/tools/watermark" className="p-3 rounded-xl border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col items-center text-center gap-2 group">
                <Stamp className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">Watermarks</span>
              </Link>

              <Link href="/tools/merge" className="p-3 rounded-xl border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col items-center text-center gap-2 group">
                <Combine className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">Merge PDFs</span>
              </Link>

              <Link href="/tools/split" className="p-3 rounded-xl border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col items-center text-center gap-2 group">
                <Scissors className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">Split Pages</span>
              </Link>

              <Link href="/tools/compress" className="p-3 rounded-xl border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col items-center text-center gap-2 group col-span-2 sm:col-span-1">
                <Minimize2 className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">Compress Size</span>
              </Link>
            </div>
          </div>

          {/* Category E: Universal File Converters Strip */}
          <div className="p-4 sm:p-5 rounded-xl border border-border/70 bg-secondary/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-semibold text-foreground">
                Convert any document to a clean PDF:
              </h3>
              <span className="text-xs text-muted-foreground">Instant 1-click conversions</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Link href="/tools/docx-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-card hover:border-foreground/30 transition-all flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Word to PDF</span>
              </Link>
              <Link href="/tools/excel-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-card hover:border-foreground/30 transition-all flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Excel to PDF</span>
              </Link>
              <Link href="/tools/image-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-card hover:border-foreground/30 transition-all flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Photos to PDF</span>
              </Link>
              <Link href="/tools/csv-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-card hover:border-foreground/30 transition-all flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">CSV to PDF</span>
              </Link>
              <Link href="/tools/markdown-to-pdf" className="p-2.5 rounded-lg border border-border/60 bg-card hover:border-foreground/30 transition-all flex items-center gap-2 col-span-2 sm:col-span-1">
                <FileCode className="h-4 w-4 text-cyan-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Notes to PDF</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LIVE INTERACTIVE DEMO: Relatable Questions in Plain English */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>See it in action</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                How document chat works in real life
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Click any question below to see how the AI pulls clear answers from a rental contract:
              </p>
            </div>

            <Link href="/chat">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 self-start sm:self-auto cursor-pointer">
                <span>Open Chat Tool</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {/* Question Selector Buttons */}
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPromptIndex(idx)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg transition-all font-medium border cursor-pointer",
                    selectedPromptIndex === idx
                      ? "bg-foreground text-background font-semibold border-foreground"
                      : "bg-secondary/50 text-muted-foreground border-border/60 hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Simulated Conversation Box */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0 text-xs mt-0.5 px-1.5 py-0.5 rounded bg-blue-500/10">You</span>
                <p className="font-semibold text-foreground">
                  {samplePrompts[selectedPromptIndex].query}
                </p>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-border/40">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-xs mt-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10">Answer</span>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                  {samplePrompts[selectedPromptIndex].response}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. AUDIENCE WORKFLOWS: Built for real people */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Designed for your daily routine
            </h2>
            <p className="text-sm text-muted-foreground">
              Whether you are preparing for exams, applying for jobs, or running client billing.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-secondary/70 border border-border/60 gap-1">
              <button
                type="button"
                onClick={() => setActivePersona("students")}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer",
                  activePersona === "students"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span>Students &amp; Researchers</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona("professionals")}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer",
                  activePersona === "professionals"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Briefcase className="h-4 w-4 text-emerald-500" />
                <span>Job Seekers &amp; Careers</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona("business")}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer",
                  activePersona === "business"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Store className="h-4 w-4 text-amber-500" />
                <span>Freelancers &amp; Small Business</span>
              </button>
            </div>
          </div>

          {/* Tab Content Cards */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border/70 bg-card shadow-xs">
            {activePersona === "students" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">1</div>
                  <h3 className="font-semibold text-sm text-foreground">Summarize 50-Page Readings</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ask for a bulleted summary of dense research papers or textbook chapters before study group or exams.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">2</div>
                  <h3 className="font-semibold text-sm text-foreground">Merge Lecture Slides &amp; Notes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Combine PDFs from each week into a single study guide so you can search all your class material in one place.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">3</div>
                  <h3 className="font-semibold text-sm text-foreground">Copy Text from Book Photos</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Took a picture of a library book or whiteboard? Use the text scanner to turn that photo into copyable notes.
                  </p>
                </div>
              </div>
            )}

            {activePersona === "professionals" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">1</div>
                  <h3 className="font-semibold text-sm text-foreground">Shrink Resume for Job Portals</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Job application portals often reject files over 1MB or 2MB. Compress your resume in one click without blurry text.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">2</div>
                  <h3 className="font-semibold text-sm text-foreground">Combine Application Packets</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Combine your resume, cover letter, references, and portfolio samples into one neat document for hiring managers.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">3</div>
                  <h3 className="font-semibold text-sm text-foreground">Check Contracts in Plain English</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ask questions about employment agreements, NDAs, or non-competes to understand the exact terms before signing.
                  </p>
                </div>
              </div>
            )}

            {activePersona === "business" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">1</div>
                  <h3 className="font-semibold text-sm text-foreground">Spreadsheets to Clean Invoices</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Convert Excel (.xlsx) and CSV files into professional, styled PDF invoices and tables ready to send to clients.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">2</div>
                  <h3 className="font-semibold text-sm text-foreground">100% Confidential Financials</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Because processing happens entirely on your machine, your accounting, tax, and client documents remain completely private.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">3</div>
                  <h3 className="font-semibold text-sm text-foreground">Black Out Sensitive Details</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Use the editor to black out bank account numbers or private addresses before sharing documents externally.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. WHY ON-DEVICE PRIVACY MATTERS: Honest Comparison */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="max-w-xl space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Why on-device privacy matters
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Most online PDF tools upload your sensitive documents to their servers. Here is how we do things differently:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Other Websites */}
            <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-secondary/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs sm:text-sm">
                <X className="h-4 w-4" />
                <span>Typical PDF Websites</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>Upload your private contracts, tax returns, and records to remote servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>Require signups, email addresses, or ask for paid subscriptions after 2 files.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>Store your files in cloud databases where data leaks can happen.</span>
                </li>
              </ul>
            </div>

            {/* PDF AI Master */}
            <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                <Check className="h-4 w-4" />
                <span>PDF AI Master</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                  <span>Runs 100% inside your web browser. Your files never leave your computer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                  <span>No account needed, no email collection, no daily limits, and always free.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                  <span>Instant processing with zero wait times and complete confidentiality.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (Accordion) */}
        {/* ========================================================================= */}
        <section className="space-y-4 max-w-3xl mx-auto w-full">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Simple, transparent answers to common questions.
            </p>
          </div>

          <div className="divide-y divide-border/60 border border-border/70 rounded-xl bg-card overflow-hidden">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-foreground hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed bg-secondary/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. BOTTOM CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="p-8 sm:p-10 rounded-2xl border border-border/70 bg-secondary/30 text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Ready to work with your documents?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            No signup, no waiting. Choose a tool or drag and drop your file to get started immediately.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/chat">
              <Button size="default" className="text-xs sm:text-sm font-semibold cursor-pointer gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Chat with a Document</span>
              </Button>
            </Link>
            <Link href="/documents">
              <Button size="default" variant="outline" className="text-xs sm:text-sm font-semibold cursor-pointer gap-2">
                <Eye className="h-3.5 w-3.5" />
                <span>Open Document Viewer</span>
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
