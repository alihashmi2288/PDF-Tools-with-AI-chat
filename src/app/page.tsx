import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Sparkles,
  Zap,
  Merge,
  Split,
  Minimize2,
  Edit,
  ScanText,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] overflow-hidden bg-background">

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-900"></div>
      </div>

      <div className="container px-4 md:px-6 py-12 md:py-24 space-y-24">

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto pt-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Powered by Advanced AI</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Enhance your PDF Experience with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 animate-gradient-x">Intelligent Tools</span>
          </h1>

          <p className="mx-auto max-w-[800px] text-muted-foreground text-lg md:text-xl leading-relaxed">
            Experience the ultimate PDF workspace. Chat with your documents, edit with ease, and unlock the power of intelligent tools designed for modern professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center pt-4">
            <Link href="/documents">
              <Button size="lg" className="h-14 px-10 w-full sm:w-auto text-lg font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="h-14 px-10 w-full sm:w-auto text-lg font-medium hover:bg-secondary/50 border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                Meet the Developer
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground pt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
              <span>No Signup Required</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <Link href="/chat" className="group">
            <div className="h-full p-8 border rounded-2xl bg-card hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24 text-blue-500" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Chat Assistant</h3>
              <p className="text-muted-foreground leading-relaxed">
                Interact with your PDFs naturally. Ask questions, get summaries, and find information instantly.
              </p>
            </div>
          </Link>

          <Link href="/tools/edit" className="group">
            <div className="h-full p-8 border rounded-2xl bg-card hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Edit className="h-24 w-24 text-green-500" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Edit className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Editor</h3>
              <p className="text-muted-foreground leading-relaxed">
                Modify text, redact sensitive data, and annotate your documents directly in the browser.
              </p>
            </div>
          </Link>

          <Link href="/tools/ocr" className="group">
            <div className="h-full p-8 border rounded-2xl bg-card hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ScanText className="h-24 w-24 text-cyan-500" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ScanText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">OCR Extraction</h3>
              <p className="text-muted-foreground leading-relaxed">
                Convert scanned images and non-selectable PDFs into editable text with high precision.
              </p>
            </div>
          </Link>

          <Link href="/tools/merge" className="group">
            <div className="h-full p-8 border rounded-2xl bg-card hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Merge className="h-24 w-24 text-orange-500" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Merge className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Merge Files</h3>
              <p className="text-muted-foreground leading-relaxed">
                Combine multiple PDF documents into a single, organized file in just a few clicks.
              </p>
            </div>
          </Link>

          <Link href="/tools/split" className="group">
            <div className="h-full p-8 border rounded-2xl bg-card hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Split className="h-24 w-24 text-red-500" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Split className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Split PDF</h3>
              <p className="text-muted-foreground leading-relaxed">
                Extract specific pages or separate a large document into smaller files effortlessly.
              </p>
            </div>
          </Link>

          <Link href="/tools/compress" className="group">
            <div className="h-full p-8 border rounded-2xl bg-card hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Minimize2 className="h-24 w-24 text-teal-500" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Minimize2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Compress PDF</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimize file size for easy sharing and storage without compromising quality.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
