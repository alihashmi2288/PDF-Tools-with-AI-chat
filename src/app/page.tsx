'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { usePDFContext } from "@/context/PDFContext";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PDFKitLogo } from "@/components/ui/PDFKitLogo";
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
    if (acceptedFiles.length > 0) {
      await handleLoadedFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  });

  const loadSampleDocument = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 750]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      page.drawText("STANDARD RESIDENTIAL LEASE AGREEMENT", {
        x: 50,
        y: 700,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page.drawText("Property Address: 428 Elm Street, Apt 3B, Austin, TX 78701", {
        x: 50,
        y: 675,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });

      const bodyLines = [
        "1. TERM: This agreement begins on September 1, 2024 and ends August 31, 2025.",
        "2. MONTHLY RENT: Tenant agrees to pay $1,450 on or before the 1st day of each month.",
        "3. SECURITY DEPOSIT: A deposit of $1,450 is required upon signing. Refunded within 21 days",
        "   following move-out inspection, minus deductions for damages beyond reasonable wear.",
        "4. PET POLICY: Small pets (under 40 lbs) are permitted with a $25 monthly pet fee.",
        "   Maximum of two (2) pets allowed per unit.",
        "5. UTILITIES: Landlord covers water and trash. Tenant is responsible for electric and internet.",
        "6. NOTICE TO VACATE: Tenant must provide at least 30 days written notice before lease expiration.",
        "7. QUIET HOURS: Observed from 10:00 PM to 7:00 AM daily.",
        "8. REPAIRS: Landlord agrees to address emergency maintenance within 24 hours of notification."
      ];

      let yPos = 630;
      for (const line of bodyLines) {
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: 10,
          font: line.includes(":") ? fontBold : font,
          color: rgb(0.2, 0.2, 0.2),
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
      a: "No. PDFKit is completely free. There are no signups, no credit cards, no monthly subscriptions, and no hidden file size limits."
    },
    {
      q: "What files can I convert to PDF?",
      a: "You can convert Microsoft Word documents (.docx), Excel spreadsheets (.xlsx), CSV data tables, Markdown notes (.md), web pages (HTML), eBooks (EPUB), and photos (JPG, PNG, WebP) directly into cleanly formatted PDFs."
    }
  ];

  return (
    <div className="relative min-h-screen bg-canvas text-ink flex flex-col items-center">
      
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-24">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Linear Marketing Style with Lavender Accent */}
        {/* ========================================================================= */}
        <section className="space-y-6 text-center max-w-3xl mx-auto pt-4">
          {/* Trust & Privacy Pill (Apple status-badge) */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-surface-1 border border-hairline text-ink-muted shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
            <span className="type-eyebrow text-[11px] text-ink font-semibold uppercase tracking-[0.4px]">
              100% Private &amp; Secure
            </span>
            <span className="text-hairline-strong">•</span>
            <span className="type-eyebrow text-[11px] text-ink-subtle uppercase tracking-[0.4px]">
              Files Never Leave Your Device
            </span>
          </div>

          {/* Punchy, Clear Value Headline */}
          <div className="space-y-4">
            <h1 className="type-display-xl text-ink">
              Everything you need for PDFs. Fast, simple, and 100% private.
            </h1>
            <p className="type-subhead text-ink-subtle max-w-2xl mx-auto leading-relaxed">
              Chat with your documents, merge pages, shrink file sizes, edit, and convert in seconds. No signups, no credit cards, and completely private on your device.
            </p>
          </div>

          {/* Linear Button CTAs (8px rectangular corners) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadSampleDocument}
              disabled={isProcessing}
              className="h-9 px-5 rounded-[8px] bg-primary text-white hover:bg-primary-hover active:bg-primary-focus font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.98]"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Try Sample Document</span>
            </button>

            <Link href="/chat/workspace">
              <button
                type="button"
                className="h-9 px-5 rounded-[8px] bg-surface-1 text-ink border border-hairline hover:bg-surface-2 hover:border-hairline-strong font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.98]"
              >
                <FolderGit2 className="h-3.5 w-3.5 opacity-70" />
                <span>Multi-Document Workspace</span>
              </button>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SPEC STRIP: Clean Hairline Dividers & Linear Eyebrows */}
        {/* ========================================================================= */}
        <div className="border-y border-hairline py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-0.5">
            <span className="type-eyebrow text-[10px] text-ink-tertiary uppercase tracking-[0.4px]">PRIVACY</span>
            <p className="text-xs font-semibold text-ink">Stays on Your Device</p>
          </div>
          <div className="space-y-0.5">
            <span className="type-eyebrow text-[10px] text-ink-tertiary uppercase tracking-[0.4px]">ZERO UPLOADS</span>
            <p className="text-xs font-semibold text-ink">Nothing Saved Online</p>
          </div>
          <div className="space-y-0.5">
            <span className="type-eyebrow text-[10px] text-ink-tertiary uppercase tracking-[0.4px]">ALL-IN-ONE</span>
            <p className="text-xs font-semibold text-ink">44+ Free Tools</p>
          </div>
          <div className="space-y-0.5">
            <span className="type-eyebrow text-[10px] text-ink-tertiary uppercase tracking-[0.4px]">ALWAYS FREE</span>
            <p className="text-xs font-semibold text-ink">No Signup Needed</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE DOCUMENT DROPZONE (Linear Product UI Frame) */}
        {/* ========================================================================= */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="linear-product-panel p-5 sm:p-7 space-y-4">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2 text-xs">
                <FileCheck className="h-4 w-4 text-primary" />
                <span className="font-semibold text-ink">Document Workspace</span>
                <span className="text-hairline-strong">•</span>
                <span className="type-mono-eyebrow text-[10px] text-ink-subtle">Free &amp; Confidential</span>
              </div>

              {!droppedFile && (
                <button
                  type="button"
                  onClick={loadSampleDocument}
                  disabled={isProcessing}
                  className="text-xs px-2.5 py-1 rounded-[6px] font-medium transition-colors bg-surface-2 hover:bg-surface-3 text-ink flex items-center gap-1.5 border border-hairline cursor-pointer shadow-xs"
                >
                  <Zap className="h-3 w-3 text-primary" />
                  <span>Try Sample Lease</span>
                </button>
              )}
            </div>

            {/* Drop Area Content */}
            {!droppedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  "relative group rounded-[12px] border border-dashed transition-all duration-200 p-8 sm:p-10 cursor-pointer text-center bg-surface-2/40 flex flex-col items-center justify-center min-h-[190px]",
                  isDragActive
                    ? "border-primary bg-surface-2 ring-2 ring-primary/30"
                    : "border-hairline hover:border-hairline-strong hover:bg-surface-2/70"
                )}
              >
                <input {...getInputProps()} />

                <div className="w-10 h-10 rounded-[8px] bg-surface-1 border border-hairline shadow-xs flex flex-col items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="h-4 w-4 text-ink" />
                </div>

                <div className="space-y-1 pointer-events-none">
                  <p className="font-semibold text-xs sm:text-sm text-ink">
                    Drop any document here, or <span className="underline decoration-hairline-strong underline-offset-4">browse your files</span>
                  </p>
                  <p className="text-xs text-ink-subtle max-w-sm mx-auto">
                    Works with PDF, Word, Excel, PowerPoint, Text notes, and Photos
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <span className="text-xs text-ink-subtle">Don&apos;t have a file ready?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadSampleDocument();
                    }}
                    className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="h-3 w-3" />
                    Load a sample lease agreement
                  </button>
                </div>
              </div>
            ) : (
              /* Active Loaded File State */
              <div className="space-y-4 p-4 rounded-[12px] border border-hairline bg-surface-2/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-8 rounded-[6px] bg-surface-1 border border-hairline shadow-xs flex flex-col justify-between p-1.5 shrink-0">
                      <div className="w-3 h-0.5 rounded-full bg-primary" />
                      <div className="w-full h-0.5 rounded-full bg-ink/20" />
                      <div className="w-4 h-0.5 rounded-full bg-ink/30" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs sm:text-sm text-ink truncate max-w-xs sm:max-w-md">
                          {droppedFile.name}
                        </p>
                        <span className="type-mono-eyebrow text-[9px] px-1.5 py-0.5 rounded-[4px] bg-primary/15 text-primary-hover border border-primary/25">
                          Ready
                        </span>
                      </div>
                      <p className="type-mono-eyebrow text-[10px] text-ink-subtle mt-0.5">
                        {formatFileSize(droppedFile.size)} • Stored safely on your computer
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-ink-subtle hover:text-ink self-start sm:self-auto cursor-pointer"
                    onClick={clearDroppedFile}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                {/* Immediate Action Buttons */}
                <div className="pt-2 border-t border-hairline">
                  <p className="type-mono-eyebrow text-[10px] text-ink-subtle mb-2">
                    Choose what to do with this file:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => routeToFileAction("/chat")}
                      className="h-8.5 px-3 rounded-[8px] bg-primary text-white hover:bg-primary-hover active:bg-primary-focus font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="truncate">Ask AI Questions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => routeToFileAction("/tools/view")}
                      className="h-8.5 px-3 rounded-[8px] bg-surface-1 text-ink border border-hairline font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer hover:bg-surface-2 hover:border-hairline-strong transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">View in Reader</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => routeToFileAction("/tools/edit")}
                      className="h-8.5 px-3 rounded-[8px] bg-surface-1 text-ink border border-hairline font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer hover:bg-surface-2 hover:border-hairline-strong transition-colors"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">Edit Canvas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => routeToFileAction("/tools/compress")}
                      className="h-8.5 px-3 rounded-[8px] bg-surface-1 text-ink border border-hairline font-medium text-xs flex items-center justify-start gap-2 shadow-xs cursor-pointer hover:bg-surface-2 hover:border-hairline-strong transition-colors"
                    >
                      <Minimize2 className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">Shrink File Size</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Assurance Footer */}
            <div className="flex items-center justify-between text-[11px] text-ink-subtle pt-1 border-t border-hairline">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-[#16a34a]" />
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
            <span className="type-eyebrow text-[11px] text-ink-subtle uppercase tracking-[0.4px]">
              ALL-IN-ONE TOOLBOX
            </span>
            <h2 className="type-headline text-ink">
              What would you like to do?
            </h2>
            <p className="text-xs sm:text-sm text-ink-subtle">
              44+ simple, private tools to organize, convert, sign, and understand documents on your device.
            </p>
          </div>

          {/* Category Tabs (Apple Segmented Pill Switch) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-surface-1 border border-hairline max-w-fit mx-auto shadow-xs">
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
                  "h-8 px-4 text-xs font-medium rounded-full transition-all cursor-pointer",
                  activeCategory === tab.id
                    ? "bg-primary text-white font-medium shadow-xs"
                    : "text-ink-subtle hover:text-ink hover:bg-surface-2"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category A: High-Value AI Tools */}
          {(activeCategory === "all" || activeCategory === "ai") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="type-eyebrow text-[11px] text-ink font-semibold tracking-[0.4px] uppercase">
                  AI Intelligence &amp; Multi-Document Workspace
                </span>
                <span className="type-mono-eyebrow text-[10px] text-ink-subtle">Smart Document Analysis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  href="/chat/workspace"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                        <FolderGit2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="type-mono-eyebrow text-[9px] px-2 py-0.5 rounded-[4px] bg-surface-2 border border-hairline text-ink-muted font-medium">
                        Popular
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                        Multi-Document Workspace
                      </h3>
                      <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                        Upload several PDFs together to ask questions, compare differences, and get verified answers across all files.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-ink gap-1 group-hover:translate-x-1 group-hover:text-primary transition-all">
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
                      <div className="h-8 w-8 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                        <Scale className="h-4 w-4 text-primary" />
                      </div>
                      <span className="type-mono-eyebrow text-[9px] px-2 py-0.5 rounded-[4px] bg-surface-2 border border-hairline text-ink-muted">
                        High Value
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                        Contract Reviewer &amp; Scanner
                      </h3>
                      <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                        Compare two contract versions side-by-side to catch added risks, altered numbers, and trap clauses.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-ink gap-1 group-hover:translate-x-1 group-hover:text-primary transition-all">
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
                      <div className="h-8 w-8 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                        <ReceiptText className="h-4 w-4 text-primary" />
                      </div>
                      <span className="type-mono-eyebrow text-[9px] px-2 py-0.5 rounded-[4px] bg-surface-2 border border-hairline text-ink-muted">
                        Finance
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                        Invoice &amp; Table Extractor
                      </h3>
                      <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                        Scan bills, receipts, and invoices to pull structured tables and line items straight into Excel.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-ink gap-1 group-hover:translate-x-1 group-hover:text-primary transition-all">
                    <span>Extract tables</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/translate"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                        <Languages className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                        Document Translator
                      </h3>
                      <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                        Translate documents into Spanish, French, German, Arabic, Urdu, or Chinese with a side-by-side view.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-ink gap-1 group-hover:translate-x-1 group-hover:text-primary transition-all">
                    <span>Translate document</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/study-ai"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                        Flashcards &amp; Practice Quizzes
                      </h3>
                      <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                        Turn textbook chapters and lecture slides into interactive study cards and practice tests in seconds.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-ink gap-1 group-hover:translate-x-1 group-hover:text-primary transition-all">
                    <span>Create study materials</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/chat"
                  className="hairline-card p-5 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                        Chat with Any PDF
                      </h3>
                      <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                        Ask questions about any document and receive clear, accurate answers and summaries in plain language.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-medium text-ink gap-1 group-hover:translate-x-1 group-hover:text-primary transition-all">
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
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="type-eyebrow text-[11px] text-ink font-semibold tracking-[0.4px] uppercase">
                  Signatures, Security &amp; Protection
                </span>
                <span className="type-mono-eyebrow text-[10px] text-ink-subtle">Simple &amp; Legally Sound</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Link
                  href="/tools/sign"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                      <PenTool className="h-3.5 w-3.5 text-ink" />
                    </div>
                    <h4 className="font-semibold text-xs text-ink group-hover:text-primary transition-colors">
                      e-Sign PDF
                    </h4>
                    <p className="text-[11px] text-ink-subtle leading-relaxed">
                      Draw, type, or upload your signature to sign documents.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-ink gap-1 group-hover:text-primary transition-colors">
                    <span>Sign</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/flatten-pdf"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                      <Lock className="h-3.5 w-3.5 text-ink" />
                    </div>
                    <h4 className="font-semibold text-xs text-ink group-hover:text-primary transition-colors">
                      Flatten PDF (Lock)
                    </h4>
                    <p className="text-[11px] text-ink-subtle leading-relaxed">
                      Lock form fields and stamps so no one can edit them.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-ink gap-1 group-hover:text-primary transition-colors">
                    <span>Lock PDF</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/pdf-to-pdfa"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                      <Award className="h-3.5 w-3.5 text-ink" />
                    </div>
                    <h4 className="font-semibold text-xs text-ink group-hover:text-primary transition-colors">
                      PDF/A Archival
                    </h4>
                    <p className="text-[11px] text-ink-subtle leading-relaxed">
                      Convert for permanent government &amp; legal archives.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-ink gap-1 group-hover:text-primary transition-colors">
                    <span>Archive</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/protect"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                      <Lock className="h-3.5 w-3.5 text-ink" />
                    </div>
                    <h4 className="font-semibold text-xs text-ink group-hover:text-primary transition-colors">
                      Password Protect
                    </h4>
                    <p className="text-[11px] text-ink-subtle leading-relaxed">
                      Lock your PDF with strong password encryption.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-ink gap-1 group-hover:text-primary transition-colors">
                    <span>Protect</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/unlock"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                      <Unlock className="h-3.5 w-3.5 text-ink" />
                    </div>
                    <h4 className="font-semibold text-xs text-ink group-hover:text-primary transition-colors">
                      Unlock PDF
                    </h4>
                    <p className="text-[11px] text-ink-subtle leading-relaxed">
                      Remove password restrictions and edit permissions.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-ink gap-1 group-hover:text-primary transition-colors">
                    <span>Unlock</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>

                <Link
                  href="/tools/form-filler"
                  className="hairline-card p-4 hairline-card-hover flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="h-7 w-7 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline">
                      <FileEdit className="h-3.5 w-3.5 text-ink" />
                    </div>
                    <h4 className="font-semibold text-xs text-ink group-hover:text-primary transition-colors">
                      Fill PDF Forms
                    </h4>
                    <p className="text-[11px] text-ink-subtle leading-relaxed">
                      Fill out forms and tax documents online easily.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center text-[11px] font-medium text-ink gap-1 group-hover:text-primary transition-colors">
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
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="type-eyebrow text-[11px] text-ink font-semibold tracking-[0.4px] uppercase">
                  Organize &amp; Edit Pages
                </span>
                <span className="type-mono-eyebrow text-[10px] text-ink-subtle">Fast Everyday Tools</span>
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
                    <item.icon className="h-4 w-4 text-ink-subtle group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium text-ink">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category D: File Converters */}
          {(activeCategory === "all" || activeCategory === "convert") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="type-eyebrow text-[11px] text-ink font-semibold tracking-[0.4px] uppercase">
                  Convert Between PDF &amp; Other Formats
                </span>
                <span className="type-mono-eyebrow text-[10px] text-ink-subtle">High Fidelity Output</span>
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
                    <item.icon className="h-4 w-4 text-ink-subtle group-hover:text-primary shrink-0 transition-colors" />
                    <span className="text-xs font-medium text-ink truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE DEMO (Linear Product Panel Framing) */}
        {/* ========================================================================= */}
        <section className="linear-product-panel p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <span className="type-eyebrow text-[10px] text-ink-subtle mb-1 block uppercase tracking-[0.4px]">
                SEE IT IN ACTION
              </span>
              <h2 className="type-heading-md text-ink">
                Ask questions in plain English, get instant answers
              </h2>
              <p className="text-xs text-ink-subtle mt-0.5">
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
                    "text-xs px-3.5 py-1.5 rounded-full transition-all font-medium border cursor-pointer",
                    selectedPromptIndex === idx
                      ? "bg-primary text-white border-primary font-medium shadow-xs"
                      : "bg-surface-1 text-ink-subtle border-hairline hover:text-ink hover:bg-surface-2"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Conversation Preview Box: Paper Document Sheet Presentation */}
            <div className="paper-sheet paper-sheet-stacked p-5 sm:p-6 rounded-[12px] border border-paper-border space-y-4 shadow-xs text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="type-mono-eyebrow text-[10px] text-ink-subtle px-2 py-0.5 rounded-[4px] bg-surface-2 border border-hairline shrink-0">
                    QUESTION
                  </span>
                  <p className="font-semibold text-ink text-xs sm:text-sm">
                    {samplePrompts[selectedPromptIndex].query}
                  </p>
                </div>

                <span className="paper-citation-pill text-[9px] shrink-0 hidden sm:inline-flex">
                  Page 1, §3
                </span>
              </div>

              <div className="pt-3 border-t border-hairline space-y-2">
                <div className="flex items-center gap-2">
                  <span className="type-mono-eyebrow text-[10px] text-primary-hover px-2 py-0.5 rounded-[4px] bg-primary/15 border border-primary/25 shrink-0 font-medium">
                    DOCUMENT ANSWER
                  </span>
                  <span className="type-mono-eyebrow text-[10px] text-ink-subtle">
                    Source Verified
                  </span>
                </div>
                <p className="paper-prose text-ink-muted leading-relaxed text-xs sm:text-sm pl-1">
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
            <span className="type-eyebrow text-[11px] text-ink-subtle uppercase tracking-[0.4px]">
              BUILT FOR YOUR DAILY ROUTINE
            </span>
            <h2 className="type-heading-md text-ink">
              Designed for real people and busy schedules
            </h2>
            <p className="text-xs text-ink-subtle">
              Whether you are preparing for exams, applying for jobs, or sending client invoices.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-full bg-surface-1 border border-hairline gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActivePersona("students")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer",
                  activePersona === "students"
                    ? "bg-primary text-white font-medium shadow-xs"
                    : "text-ink-subtle hover:text-ink hover:bg-surface-2"
                )}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Students &amp; Researchers</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona("professionals")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer",
                  activePersona === "professionals"
                    ? "bg-primary text-white font-medium shadow-xs"
                    : "text-ink-subtle hover:text-ink hover:bg-surface-2"
                )}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Job Seekers &amp; Careers</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona("business")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer",
                  activePersona === "business"
                    ? "bg-primary text-white font-medium shadow-xs"
                    : "text-ink-subtle hover:text-ink hover:bg-surface-2"
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
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">01 • SUMMARIZE</span>
                  <h3 className="font-semibold text-sm text-ink">Summarize 50-Page Readings</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Ask for a quick bulleted summary of dense research papers and textbook chapters before class or exams.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">02 • ORGANIZE</span>
                  <h3 className="font-semibold text-sm text-ink">Merge Lecture Slides &amp; Notes</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Combine PDFs from each semester week into a single study guide so all your material is in one place.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">03 • COPY TEXT</span>
                  <h3 className="font-semibold text-sm text-ink">Copy Text from Book Photos</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Took a photo of a whiteboard or library book? Use the text scanner to turn that photo into editable notes.
                  </p>
                </div>
              </div>
            )}

            {activePersona === "professionals" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">01 • JOB READY</span>
                  <h3 className="font-semibold text-sm text-ink">Shrink Resume for Job Portals</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Job portals often reject resumes over 1MB or 2MB. Compress your file in one click without blurry text.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">02 • APPLICATIONS</span>
                  <h3 className="font-semibold text-sm text-ink">Combine Application Packets</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Merge your resume, cover letter, references, and work samples into one neat file for hiring managers.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">03 • PEACE OF MIND</span>
                  <h3 className="font-semibold text-sm text-ink">Check Agreements in Plain English</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Ask questions about employment agreements, NDAs, or non-competes to understand the exact terms before signing.
                  </p>
                </div>
              </div>
            )}

            {activePersona === "business" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">01 • INVOICING</span>
                  <h3 className="font-semibold text-sm text-ink">Spreadsheets to Clean Invoices</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Convert Excel (.xlsx) and CSV spreadsheets into professional, clean PDF invoices ready to send to clients.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">02 • 100% CONFIDENTIAL</span>
                  <h3 className="font-semibold text-sm text-ink">Completely Private Financials</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
                    Because processing happens entirely on your machine, your accounting, tax, and client files stay strictly private.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="type-eyebrow text-[10px] text-primary tracking-[0.4px] font-mono">03 • PRIVACY</span>
                  <h3 className="font-semibold text-sm text-ink">Black Out Sensitive Details</h3>
                  <p className="text-xs text-ink-subtle leading-relaxed">
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
            <span className="type-eyebrow text-[11px] text-ink-subtle uppercase tracking-[0.4px]">
              YOUR PRIVACY MATTERS
            </span>
            <h2 className="type-heading-md text-ink">
              Why keeping files on your device is better
            </h2>
            <p className="text-xs text-ink-subtle">
              Most online PDF tools upload your sensitive documents to their servers. Here is how we do things differently:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Standard Cloud PDF Sites */}
            <div className="p-5 rounded-[12px] border border-hairline bg-surface-1 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-xs text-ink-subtle">
                <X className="h-4 w-4 text-ink-tertiary" />
                <span>Typical PDF Websites</span>
              </div>
              <ul className="space-y-2 text-xs text-ink-subtle">
                <li className="flex items-start gap-2">
                  <span className="text-ink-tertiary mt-0.5">•</span>
                  <span>Upload your private contracts, tax returns, and records to remote servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ink-tertiary mt-0.5">•</span>
                  <span>Require signups, collect emails, or ask for paid subscriptions after 2 files.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ink-tertiary mt-0.5">•</span>
                  <span>Store your files in cloud databases where data leaks can happen.</span>
                </li>
              </ul>
            </div>

            {/* PDFKit */}
            <div className="p-5 rounded-[12px] border border-hairline-strong bg-surface-2 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-xs text-ink">
                <PDFKitLogo size={18} />
                <span>PDFKit</span>
              </div>
              <ul className="space-y-2 text-xs text-ink">
                <li className="flex items-start gap-2">
                  <span className="text-[#16a34a] mt-0.5 font-bold">✓</span>
                  <span>Runs 100% inside your web browser. Your files never leave your computer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#16a34a] mt-0.5 font-bold">✓</span>
                  <span>No account needed, no email required, no daily limits, and always free.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#16a34a] mt-0.5 font-bold">✓</span>
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
            <span className="type-eyebrow text-[11px] text-ink-subtle uppercase tracking-[0.4px]">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="type-heading-md text-ink">
              Simple, transparent answers
            </h2>
          </div>

          <div className="divide-y divide-hairline border border-hairline rounded-[12px] bg-surface-1 overflow-hidden shadow-xs">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-medium text-xs sm:text-sm text-ink hover:bg-surface-2/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-ink-subtle shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-ink-subtle shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-ink-muted leading-relaxed bg-surface-2/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. BOTTOM CALL TO ACTION (Linear cta-banner) */}
        {/* ========================================================================= */}
        <section className="hairline-card p-8 sm:p-14 text-center space-y-6 max-w-2xl mx-auto">
          <span className="type-eyebrow text-[11px] text-primary tracking-[0.4px] uppercase font-semibold">
            START IMMEDIATELY
          </span>
          <h2 className="type-display-md text-ink">
            Ready to work with your documents?
          </h2>
          <p className="text-xs sm:text-sm text-ink-subtle max-w-md mx-auto leading-relaxed">
            No signup, no waiting. Choose any tool or drag and drop your file to get started immediately.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/chat">
              <button
                type="button"
                className="h-9 px-5 rounded-[8px] bg-primary text-white hover:bg-primary-hover active:bg-primary-focus font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Chat with a Document</span>
              </button>
            </Link>
            <Link href="/tools/view">
              <button
                type="button"
                className="h-9 px-5 rounded-[8px] bg-surface-1 text-ink border border-hairline hover:bg-surface-2 hover:border-hairline-strong font-medium text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
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
