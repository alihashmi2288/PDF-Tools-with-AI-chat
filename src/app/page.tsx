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
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { setFile, setPdfText } = usePDFContext();
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [activePersona, setActivePersona] = useState<"students" | "professionals" | "business">("students");
  const [activeCategory, setActiveCategory] = useState<"all" | "ai" | "security" | "organize" | "convert">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Everyday sample lease questions & answers for live demonstration
  const samplePrompts = [
    {
      title: "Security Deposit",
      query: "How much is the security deposit and when do I get it back?",
      response: "The security deposit is $1,450 (equal to one month's rent). It is fully refundable within 21 days after you move out, as long as there is no damage beyond normal wear and tear."
    },
    {
      title: "Pet Policy",
      query: "Are pets allowed in the apartment, and is there an extra fee?",
      response: "Yes! Small cats and dogs (under 40 lbs) are welcome with a $25/month pet fee. Up to two pets are permitted per apartment."
    },
    {
      title: "Moving Out Notice",
      query: "How much advance notice is required to cancel or move out?",
      response: "A 30-day written notice is required before the end of your lease term if you do not plan to renew."
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
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      page.drawText("RESIDENTIAL LEASE AGREEMENT & SUMMARY", {
        x: 50,
        y: 780,
        size: 15,
        font: fontBold,
        color: rgb(0.09, 0.09, 0.09),
      });

      page.drawText("Property: 742 Evergreen Terrace, Apt 4B • Term: 12 Months", {
        x: 50,
        y: 755,
        size: 9.5,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
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
          color: rgb(0.09, 0.09, 0.09),
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
      q: "Are my documents kept private and secure?",
      a: "Yes, 100%. All document operations—merging, splitting, compressing, viewing, signing, and converting—run directly on your computer inside your web browser. Your private documents never touch our servers."
    },
    {
      q: "How does the AI chat work if my files stay private?",
      a: "When you ask a question, the app reads the relevant text locally on your device and sends only that specific question and excerpt securely to Google Gemini. Your full PDF file is never stored, uploaded, or shared."
    },
    {
      q: "Do I need to sign up, create an account, or pay?",
      a: "No. PDF AI Master is completely free. There are no signups, no credit cards, no monthly subscriptions, and no hidden file size limits."
    },
    {
      q: "What files can I convert to PDF?",
      a: "You can convert Microsoft Word documents (.docx), Excel spreadsheets (.xlsx), CSV data tables, Markdown notes (.md), web pages (HTML), eBooks (EPUB), and photos (JPG, PNG, WebP) directly into cleanly formatted PDFs."
    }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center overflow-hidden">
      
      {/* Soft Multi-Stop Hero Mesh Gradient */}
      <div className="hero-mesh-canvas">
        <div className="hero-mesh-gradient" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-24">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Human-Friendly, High-Converting Marketing Copy */}
        {/* ========================================================================= */}
        <section className="space-y-6 text-center max-w-3xl mx-auto pt-4">
          {/* Trust & Privacy Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-card border border-border text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
              100% Private &amp; Secure
            </span>
            <span className="text-border">•</span>
            <span className="type-mono-eyebrow text-[11px] text-muted-foreground">
              Files Never Leave Your Device
            </span>
          </div>

          {/* Punchy, Clear Value Headline */}
          <div className="space-y-4">
            <h1 className="type-display-xl text-foreground">
              Everything you need for PDFs. Fast, simple, and 100% private.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Chat with your documents, merge pages, shrink file sizes, edit, and convert in seconds. No signups, no credit cards, and completely private on your device.
            </p>
          </div>

          {/* Marketing Pill CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadSampleDocument}
              disabled={isProcessing}
              className="h-10 px-6 rounded-[100px] bg-[#171717] dark:bg-white text-white dark:text-black hover:bg-[#2e2e2e] dark:hover:bg-[#ededed] font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.98]"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Try Sample Document</span>
            </button>

            <Link href="/chat/workspace">
              <button
                type="button"
                className="h-10 px-6 rounded-[100px] bg-card text-foreground border border-border hover:border-foreground/30 font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.98]"
              >
                <FolderGit2 className="h-3.5 w-3.5 opacity-70" />
                <span>Multi-Document Workspace</span>
              </button>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SPEC STRIP: Simple, Honest Customer Benefits */}
        {/* ========================================================================= */}
        <div className="border-y border-border py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-0.5">
            <span className="type-mono-eyebrow text-[10px] text-muted-foreground">PRIVACY</span>
            <p className="text-xs font-semibold text-foreground">Stays on Your Device</p>
          </div>
          <div className="space-y-0.5">
            <span className="type-mono-eyebrow text-[10px] text-muted-foreground">ZERO UPLOADS</span>
            <p className="text-xs font-semibold text-foreground">Nothing Saved Online</p>
          </div>
          <div className="space-y-0.5">
            <span className="type-mono-eyebrow text-[10px] text-muted-foreground">ALL-IN-ONE</span>
            <p className="text-xs font-semibold text-foreground">44+ Free Tools</p>
          </div>
          <div className="space-y-0.5">
            <span className="type-mono-eyebrow text-[10px] text-muted-foreground">ALWAYS FREE</span>
            <p className="text-xs font-semibold text-foreground">No Signup Needed</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE DOCUMENT DROPZONE (Start Immediately) */}
        {/* ========================================================================= */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="hairline-card p-5 sm:p-7 space-y-4">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-xs">
                <FileCheck className="h-4 w-4 text-foreground" />
                <span className="font-semibold text-foreground">Document Workspace</span>
                <span className="text-border">•</span>
                <span className="type-mono-eyebrow text-[10px] text-muted-foreground">Free &amp; Confidential</span>
              </div>

              {!droppedFile && (
                <button
                  type="button"
                  onClick={loadSampleDocument}
                  disabled={isProcessing}
                  className="text-xs px-2.5 py-1 rounded-[6px] font-medium transition-colors bg-secondary hover:bg-muted text-foreground flex items-center gap-1.5 border border-border cursor-pointer shadow-xs"
                >
                  <Zap className="h-3 w-3" />
                  <span>Try Sample Lease</span>
                </button>
              )}
            </div>

            {/* Drop Area Content */}
            {!droppedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  "relative group rounded-[8px] border border-dashed transition-all duration-200 p-8 sm:p-10 cursor-pointer text-center bg-secondary/30 flex flex-col items-center justify-center min-h-[190px]",
                  isDragActive
                    ? "border-foreground bg-secondary/80 ring-1 ring-foreground/20"
                    : "border-border hover:border-foreground/40 hover:bg-secondary/60"
                )}
              >
                <input {...getInputProps()} />

                <div className="w-10 h-10 rounded-[6px] bg-card border border-border shadow-xs flex flex-col items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="h-4 w-4 text-foreground" />
                </div>

                <div className="space-y-1 pointer-events-none">
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    Drop any document here, or <span className="underline decoration-border underline-offset-4">browse your files</span>
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Works with PDF, Word, Excel, PowerPoint, Text notes, and Photos
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
                    className="text-xs font-semibold text-foreground underline hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="h-3 w-3" />
                    Load a sample lease agreement
                  </button>
                </div>
              </div>
            ) : (
              /* Active Loaded File State */
              <div className="space-y-4 p-4 rounded-[8px] border border-border bg-secondary/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-8 rounded-[6px] bg-card border border-border shadow-xs flex flex-col justify-between p-1.5 shrink-0">
                      <div className="w-3 h-0.5 rounded-full bg-foreground/40" />
                      <div className="w-full h-0.5 rounded-full bg-foreground/20" />
                      <div className="w-4 h-0.5 rounded-full bg-foreground/30" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-xs sm:max-w-md">
                          {droppedFile.name}
                        </p>
                        <span className="type-mono-eyebrow text-[9px] px-1.5 py-0.5 rounded-[4px] bg-foreground/10 text-foreground border border-border">
                          Ready
                        </span>
                      </div>
                      <p className="type-mono-eyebrow text-[10px] text-muted-foreground mt-0.5">
                        {formatFileSize(droppedFile.size)} • Stored safely on your computer
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto cursor-pointer"
                    onClick={clearDroppedFile}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                {/* Immediate Action Buttons */}
                <div className="pt-2 border-t border-border">
                  <p className="type-mono-eyebrow text-[10px] text-muted-foreground mb-2">
                    Choose what to do with this file:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => routeToFileAction("/chat")}
                      className="h-8 px-3 rounded-[6px] bg-[#171717] dark:bg-white text-white dark:text-black font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="truncate">Ask AI Questions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => routeToFileAction("/tools/view")}
                      className="h-8 px-3 rounded-[6px] bg-card text-foreground border border-border font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">View in Reader</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => routeToFileAction("/tools/edit")}
                      className="h-8 px-3 rounded-[6px] bg-card text-foreground border border-border font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">Edit Canvas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => routeToFileAction("/tools/compress")}
                      className="h-8 px-3 rounded-[6px] bg-card text-foreground border border-border font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <Minimize2 className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">Shrink File Size</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Assurance Footer */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-emerald-500" />
                <span>Your file stays completely private in your browser. Nothing is saved online.</span>
              </span>
              <span className="type-mono-eyebrow text-[10px] hidden sm:inline">100% Free &amp; Private</span>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TASK-ORIENTED TOOL DIRECTORY */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="type-mono-eyebrow text-[11px] text-muted-foreground">
              ALL-IN-ONE TOOLBOX
            </span>
            <h2 className="type-heading-lg text-foreground">
              What would you like to do?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              44+ simple, private tools to organize, convert, sign, and understand documents on your device.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Tools" },
              { id: "ai", label: "AI Superpowers" },
              { id: "security", label: "Sign & Protect" },
              { id: "organize", label: "Organize Pages" },
              { id: "convert", label: "Convert Files" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={cn(
                  "h-8 px-4 text-xs font-medium rounded-[64px] border transition-all cursor-pointer",
                  activeCategory === tab.id
                    ? "bg-[#171717] dark:bg-white text-white dark:text-black border-transparent shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category A: High-Value AI Tools */}
          {(activeCategory === "all" || activeCategory === "ai") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
                  AI Intelligence &amp; Multi-Document Workspace
                </span>
                <span className="type-mono-eyebrow text-[10px] text-muted-foreground">Smart Document Analysis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  href="/chat/workspace"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                        <FolderGit2 className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="type-mono-eyebrow text-[9px] px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-foreground font-medium">
                        Popular
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                        Multi-Document Workspace
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Upload several PDFs together to ask questions, compare differences, and get verified answers across all files.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open workspace</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/contract-scanner"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                        <Scale className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="type-mono-eyebrow text-[9px] px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-foreground">
                        High Value
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                        Contract Reviewer &amp; Scanner
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Compare two contract versions side-by-side to catch added risks, altered numbers, and trap clauses.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Review contract</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/invoice-extractor"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                        <ReceiptText className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="type-mono-eyebrow text-[9px] px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-foreground">
                        Finance
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                        Invoice &amp; Table Extractor
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Scan bills, receipts, and invoices to pull structured tables and line items straight into Excel.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Extract tables</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/translate"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="h-8 w-8 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <Languages className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                        Document Translator
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Translate documents into Spanish, French, German, Arabic, Urdu, or Chinese with a side-by-side view.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Translate document</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/study-ai"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="h-8 w-8 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <GraduationCap className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                        Flashcards &amp; Practice Quizzes
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Turn textbook chapters and lecture slides into interactive study cards and practice tests in seconds.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Create study materials</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/chat"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="h-8 w-8 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <Sparkles className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                        Chat with Any PDF
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        Ask questions about any document and receive clear, accurate answers and summaries in plain language.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-foreground gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Start chatting</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Category B: Sign & Security */}
          {(activeCategory === "all" || activeCategory === "security") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
                  Signatures, Security &amp; Protection
                </span>
                <span className="type-mono-eyebrow text-[10px] text-muted-foreground">Simple &amp; Legally Sound</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Link
                  href="/tools/sign"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <PenTool className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-link transition-colors">
                      e-Sign PDF
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Draw, type, or upload your signature to sign documents.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-foreground gap-1">
                    <span>Sign</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/flatten-pdf"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <Lock className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-link transition-colors">
                      Flatten PDF (Lock)
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Lock form fields and stamps so no one can edit them.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-foreground gap-1">
                    <span>Lock PDF</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/pdf-to-pdfa"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <Award className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-link transition-colors">
                      PDF/A Archival
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Convert for permanent government &amp; legal archives.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-foreground gap-1">
                    <span>Archive</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/protect"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <Lock className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-link transition-colors">
                      Password Protect
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Lock your PDF with strong password encryption.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-foreground gap-1">
                    <span>Protect</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/unlock"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <Unlock className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-link transition-colors">
                      Unlock PDF
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Remove password restrictions and edit permissions.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-foreground gap-1">
                    <span>Unlock</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/form-filler"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center border border-border">
                      <FileEdit className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-link transition-colors">
                      Fill PDF Forms
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Fill out forms and tax documents online easily.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-foreground gap-1">
                    <span>Fill forms</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Category C: Page Organization */}
          {(activeCategory === "all" || activeCategory === "organize") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
                  Organize &amp; Edit Pages
                </span>
                <span className="type-mono-eyebrow text-[10px] text-muted-foreground">Fast Everyday Tools</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {[
                  { href: "/tools/delete-pages", label: "Delete Pages", icon: Trash2 },
                  { href: "/tools/rearrange-pages", label: "Rearrange", icon: ArrowUpDown },
                  { href: "/tools/extract-pages", label: "Extract Pages", icon: Scissors },
                  { href: "/tools/grayscale-pdf", label: "Grayscale (Ink)", icon: Moon },
                  { href: "/tools/resize-pages", label: "Resize Pages", icon: Maximize2 },
                  { href: "/tools/header-footer", label: "Header & Footer", icon: Tag },
                  { href: "/tools/split-by-bookmarks", label: "Split Bookmarks", icon: Bookmark },
                  { href: "/tools/rotate", label: "Rotate Pages", icon: RotateCw },
                  { href: "/tools/crop", label: "Crop Margins", icon: Crop },
                  { href: "/tools/page-numbers", label: "Page Numbers", icon: Hash },
                  { href: "/tools/watermark", label: "Watermarks", icon: Stamp },
                  { href: "/tools/merge", label: "Merge PDFs", icon: Combine },
                  { href: "/tools/split", label: "Split Pages", icon: Scissors },
                  { href: "/tools/compress", label: "Compress Size", icon: Minimize2 },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hairline-card p-3 hairline-card-hover flex flex-col items-center text-center gap-2 group"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category D: File Converters */}
          {(activeCategory === "all" || activeCategory === "convert") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="type-mono-eyebrow text-[11px] text-foreground font-semibold">
                  Convert Between PDF &amp; Other Formats
                </span>
                <span className="type-mono-eyebrow text-[10px] text-muted-foreground">High Fidelity Output</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {[
                  { href: "/tools/pdf-to-txt", label: "PDF to Text", icon: FileText },
                  { href: "/tools/html-to-pdf", label: "HTML to PDF", icon: Code },
                  { href: "/tools/pdf-to-html", label: "PDF to Webpage", icon: Globe },
                  { href: "/tools/pdf-to-docx", label: "PDF to Word", icon: FileText },
                  { href: "/tools/pdf-to-xlsx", label: "PDF to Excel", icon: FileSpreadsheet },
                  { href: "/tools/pdf-to-pptx", label: "PDF to PowerPoint", icon: Presentation },
                  { href: "/tools/pdf-to-images", label: "PDF to Photos", icon: ImageIcon },
                  { href: "/tools/epub-to-pdf", label: "eBook to PDF", icon: BookOpen },
                  { href: "/tools/pdf-to-epub", label: "PDF to eBook", icon: Tablet },
                  { href: "/tools/svg-pdf", label: "Vector Graphics", icon: Shapes },
                  { href: "/tools/docx-to-pdf", label: "Word to PDF", icon: FileText },
                  { href: "/tools/excel-to-pdf", label: "Excel to PDF", icon: FileSpreadsheet },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hairline-card p-3 hairline-card-hover flex items-center gap-2.5 group"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE DEMO (Plain English, Real Life Example) */}
        {/* ========================================================================= */}
        <section className="hairline-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="type-mono-eyebrow text-[10px] text-muted-foreground mb-1 block">
                SEE IT IN ACTION
              </span>
              <h2 className="type-heading-md text-foreground">
                Ask questions in plain English, get instant answers
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any question below to see how the AI pulls clear, helpful answers from a real rental contract:
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
            {/* Prompt Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPromptIndex(idx)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-[6px] transition-all font-medium border cursor-pointer",
                    selectedPromptIndex === idx
                      ? "bg-[#171717] dark:bg-white text-white dark:text-black font-semibold border-transparent shadow-xs"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Conversation Preview Box */}
            <div className="p-4 sm:p-5 rounded-[8px] bg-secondary/40 border border-border space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="type-mono-eyebrow text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-[4px] bg-card border border-border shrink-0">
                  YOU
                </span>
                <p className="font-medium text-foreground text-xs sm:text-sm">
                  {samplePrompts[selectedPromptIndex].query}
                </p>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-border">
                <span className="type-mono-eyebrow text-[10px] text-foreground px-1.5 py-0.5 rounded-[4px] bg-card border border-border shrink-0">
                  ANSWER
                </span>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                  {samplePrompts[selectedPromptIndex].response}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. WORKFLOW PERSONAS: Built for Real People */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="type-mono-eyebrow text-[11px] text-muted-foreground">
              BUILT FOR YOUR DAILY ROUTINE
            </span>
            <h2 className="type-heading-md text-foreground">
              Designed for real people and busy schedules
            </h2>
            <p className="text-xs text-muted-foreground">
              Whether you are preparing for exams, applying for jobs, or sending client invoices.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-[64px] bg-secondary border border-border gap-1">
              <button
                type="button"
                onClick={() => setActivePersona("students")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-[64px] transition-all cursor-pointer",
                  activePersona === "students"
                    ? "bg-[#171717] dark:bg-white text-white dark:text-black shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Students &amp; Researchers</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona("professionals")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-[64px] transition-all cursor-pointer",
                  activePersona === "professionals"
                    ? "bg-[#171717] dark:bg-white text-white dark:text-black shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Job Seekers &amp; Careers</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona("business")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-[64px] transition-all cursor-pointer",
                  activePersona === "business"
                    ? "bg-[#171717] dark:bg-white text-white dark:text-black shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Store className="h-3.5 w-3.5" />
                <span>Freelancers &amp; Business</span>
              </button>
            </div>
          </div>

          {/* Persona Cards */}
          <div className="hairline-card p-6 sm:p-8">
            {activePersona === "students" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">01 • SUMMARIZE</span>
                  <h3 className="font-semibold text-sm text-foreground">Summarize 50-Page Readings</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ask for a quick bulleted summary of dense research papers and textbook chapters before class or exams.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">02 • ORGANIZE</span>
                  <h3 className="font-semibold text-sm text-foreground">Merge Lecture Slides &amp; Notes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Combine PDFs from each semester week into a single study guide so all your material is in one place.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">03 • COPY TEXT</span>
                  <h3 className="font-semibold text-sm text-foreground">Copy Text from Book Photos</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Took a photo of a whiteboard or library book? Use the text scanner to turn that photo into editable notes.
                  </p>
                </div>
              </div>
            )}

            {activePersona === "professionals" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">01 • JOB READY</span>
                  <h3 className="font-semibold text-sm text-foreground">Shrink Resume for Job Portals</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Job portals often reject resumes over 1MB or 2MB. Compress your file in one click without blurry text.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">02 • APPLICATIONS</span>
                  <h3 className="font-semibold text-sm text-foreground">Combine Application Packets</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Merge your resume, cover letter, references, and work samples into one neat file for hiring managers.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">03 • PEACE OF MIND</span>
                  <h3 className="font-semibold text-sm text-foreground">Check Agreements in Plain English</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ask questions about employment agreements, NDAs, or non-competes to understand the exact terms before signing.
                  </p>
                </div>
              </div>
            )}

            {activePersona === "business" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">01 • INVOICING</span>
                  <h3 className="font-semibold text-sm text-foreground">Spreadsheets to Clean Invoices</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Convert Excel (.xlsx) and CSV spreadsheets into professional, clean PDF invoices ready to send to clients.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">02 • 100% CONFIDENTIAL</span>
                  <h3 className="font-semibold text-sm text-foreground">Completely Private Financials</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Because processing happens entirely on your machine, your accounting, tax, and client files stay strictly private.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-mono-eyebrow text-[10px] text-muted-foreground">03 • PRIVACY</span>
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
        {/* 7. WHY ON-DEVICE PRIVACY MATTERS: Honest Comparison */}
        {/* ========================================================================= */}
        <section className="hairline-card p-6 sm:p-8 space-y-5">
          <div className="max-w-xl space-y-1">
            <span className="type-mono-eyebrow text-[11px] text-muted-foreground">
              YOUR PRIVACY MATTERS
            </span>
            <h2 className="type-heading-md text-foreground">
              Why keeping files on your device is better
            </h2>
            <p className="text-xs text-muted-foreground">
              Most online PDF tools upload your sensitive documents to their servers. Here is how we do things differently:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Standard Cloud PDF Sites */}
            <div className="p-5 rounded-[8px] border border-border bg-secondary/30 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <X className="h-4 w-4 text-muted-foreground" />
                <span>Typical PDF Websites</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Upload your private contracts, tax returns, and records to remote servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Require signups, collect emails, or ask for paid subscriptions after 2 files.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Store your files in cloud databases where data leaks can happen.</span>
                </li>
              </ul>
            </div>

            {/* PDF AI Master */}
            <div className="p-5 rounded-[8px] border border-border bg-card space-y-3 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>PDF AI Master</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                  <span>Runs 100% inside your web browser. Your files never leave your computer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                  <span>No account needed, no email required, no daily limits, and always free.</span>
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
        {/* 8. FAQ ACCORDION (Simple, Transparent Answers) */}
        {/* ========================================================================= */}
        <section className="space-y-4 max-w-3xl mx-auto w-full">
          <div className="text-center space-y-1">
            <span className="type-mono-eyebrow text-[11px] text-muted-foreground">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="type-heading-md text-foreground">
              Simple, transparent answers
            </h2>
          </div>

          <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden shadow-xs">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-medium text-xs sm:text-sm text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
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
        {/* 9. BOTTOM CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="hairline-card p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto">
          <span className="type-mono-eyebrow text-[11px] text-muted-foreground">
            START IMMEDIATELY
          </span>
          <h2 className="type-display-xl text-foreground">
            Ready to work with your documents?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            No signup, no waiting. Choose any tool or drag and drop your file to get started immediately.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/chat">
              <button
                type="button"
                className="h-10 px-6 rounded-[100px] bg-[#171717] dark:bg-white text-white dark:text-black font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Chat with a Document</span>
              </button>
            </Link>
            <Link href="/tools/view">
              <button
                type="button"
                className="h-10 px-6 rounded-[100px] bg-card text-foreground border border-border hover:border-foreground/30 font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Eye className="h-3.5 w-3.5 opacity-70" />
                <span>Open PDF Reader</span>
              </button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
