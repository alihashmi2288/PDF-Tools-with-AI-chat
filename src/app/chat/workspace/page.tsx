"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { 
    FolderGit2, 
    FileText, 
    Upload, 
    Trash2, 
    Sparkles, 
    Send, 
    Bot, 
    User, 
    Loader2, 
    CheckCircle2, 
    Layers, 
    ArrowRight,
    Tag,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceDocument {
    id: string;
    file: File;
    name: string;
    size: number;
    text: string;
    isActive: boolean;
    isExtracting: boolean;
}

interface WorkspaceMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function MultiPdfWorkspacePage() {
    const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Welcome to your Multi-PDF Project Workspace! Upload 2 to 20 documents below (contracts, research papers, reports). Once loaded, ask cross-document synthesis questions like 'Compare payment terms across these vendor contracts' or 'Synthesize key conclusions across all studies.'",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isSubmitting]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newDocs: WorkspaceDocument[] = Array.from(files).map(f => ({
            id: 'doc_' + Math.random().toString(36).substring(2, 9),
            file: f,
            name: f.name,
            size: f.size,
            text: '',
            isActive: true,
            isExtracting: true,
        }));

        setDocuments(prev => [...prev, ...newDocs]);

        // Extract text in parallel
        for (const doc of newDocs) {
            try {
                const extractedText = await extractTextFromPDF(doc.file);
                setDocuments(prev =>
                    prev.map(d =>
                        d.id === doc.id
                            ? { ...d, text: extractedText, isExtracting: false }
                            : d
                    )
                );
            } catch (err) {
                console.error(`Failed to extract text for ${doc.name}:`, err);
                setDocuments(prev =>
                    prev.map(d =>
                        d.id === doc.id
                            ? { ...d, isExtracting: false }
                            : d
                    )
                );
            }
        }
    };

    const toggleDocumentActive = (id: string) => {
        setDocuments(prev =>
            prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d)
        );
    };

    const removeDocument = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const handleSendMessage = async (promptToSend?: string) => {
        const query = (promptToSend || input).trim();
        if (!query || isSubmitting) return;

        const activeDocs = documents.filter(d => d.isActive && d.text);
        if (activeDocs.length === 0) {
            alert("Please upload and enable at least one document with text before chatting.");
            return;
        }

        setInput("");
        const userMsg: WorkspaceMessage = {
            id: 'usr_' + Date.now(),
            role: 'user',
            content: query,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/ai/multi-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: query,
                    documents: activeDocs.map(d => ({
                        name: d.name,
                        text: d.text,
                    }))
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to generate multi-document answer");
            }

            const data = await res.json();
            const aiMsg: WorkspaceMessage = {
                id: 'ai_' + Date.now(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            console.error("Multi-doc chat error:", err);
            setMessages(prev => [
                ...prev,
                {
                    id: 'err_' + Date.now(),
                    role: 'assistant',
                    content: "Sorry, I ran into an issue analyzing the documents: " + (err?.message || "Unknown error"),
                    timestamp: new Date()
                }
            ]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeDocsCount = documents.filter(d => d.isActive).length;

    return (
        <div className="max-w-6xl mx-auto py-2 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                            <FolderGit2 className="h-4 w-4" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Multi-PDF Project Workspace
                        </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Chat across 5–20 documents simultaneously. Ask synthesis questions and track citations.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 text-xs font-semibold gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Add PDF Files</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-12rem)] min-h-[550px]">
                {/* Left Column: Project Documents Shelf (4 cols) */}
                <div className="lg:col-span-4 rounded-xl border border-border/70 bg-card p-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <div className="flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-xs font-bold text-foreground">
                                    Project Documents
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                {activeDocsCount} of {documents.length} active
                            </span>
                        </div>

                        {documents.length === 0 ? (
                            <div className="p-8 border border-dashed border-border/80 rounded-xl text-center space-y-2 bg-secondary/15">
                                <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                                <p className="text-xs font-semibold text-foreground">
                                    No documents loaded yet
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Upload up to 20 PDFs to ask cross-document questions
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-7 text-xs cursor-pointer mt-1"
                                >
                                    Browse PDFs
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={cn(
                                            "p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all",
                                            doc.isActive
                                                ? "border-border/80 bg-secondary/30"
                                                : "border-border/40 bg-secondary/10 opacity-60"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <input
                                                type="checkbox"
                                                checked={doc.isActive}
                                                onChange={() => toggleDocumentActive(doc.id)}
                                                className="rounded text-blue-600 cursor-pointer"
                                            />
                                            <div className="truncate">
                                                <p className="font-semibold text-foreground truncate">
                                                    {doc.name}
                                                </p>
                                                <p className="text-[10px] font-mono text-muted-foreground">
                                                    {(doc.size / 1024).toFixed(1)} KB • {doc.isExtracting ? (
                                                        <span className="text-amber-500">Extracting...</span>
                                                    ) : (
                                                        <span className="text-emerald-500 font-medium">Ready</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeDocument(doc.id)}
                                            className="text-muted-foreground hover:text-destructive cursor-pointer p-1 shrink-0"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Cross-Doc Prompts */}
                    <div className="pt-3 border-t border-border/40 space-y-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                            Suggested Cross-Doc Queries:
                        </span>
                        <div className="space-y-1">
                            {[
                                "Compare key terms and conditions across all documents",
                                "Synthesize common findings and differences",
                                "Find any conflicting numbers or deadlines"
                            ].map((promptText, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSendMessage(promptText)}
                                    disabled={activeDocsCount === 0 || isSubmitting}
                                    className="w-full text-left p-1.5 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 truncate cursor-pointer transition-colors block border border-transparent hover:border-border/60"
                                >
                                    ↳ {promptText}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Cross-Document Chat Feed (8 cols) */}
                <div className="lg:col-span-8 rounded-xl border border-border/70 bg-card flex flex-col justify-between overflow-hidden shadow-xs">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex gap-3 text-xs leading-relaxed max-w-[88%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border",
                                        m.role === 'user'
                                            ? "bg-foreground text-background border-foreground font-semibold"
                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                    )}
                                >
                                    {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                                </div>

                                <div
                                    className={cn(
                                        "p-3 rounded-xl border whitespace-pre-wrap",
                                        m.role === 'user'
                                            ? "bg-foreground text-background border-foreground"
                                            : "bg-secondary/25 text-foreground border-border/60 shadow-xs"
                                    )}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {isSubmitting && (
                            <div className="flex gap-3 text-xs max-w-[88%]">
                                <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shrink-0">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>
                                <div className="p-3 rounded-xl border border-border/60 bg-secondary/25 flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                    <span>Synthesizing cross-document citations...</span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Ribbon */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="p-3 border-t border-border/40 bg-secondary/15 flex items-center gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={activeDocsCount > 0 ? `Ask across ${activeDocsCount} active documents...` : "Upload documents to begin asking questions..."}
                            disabled={activeDocsCount === 0 || isSubmitting}
                            className="h-10 text-xs bg-background"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!input.trim() || activeDocsCount === 0 || isSubmitting}
                            className="h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Send</span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
