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
import { PaperProse } from "@/components/ui/paper-prose";

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
            content: "Welcome to your Multi-PDF Workspace! Add 2 or more documents below (such as contracts, receipts, or study notes). Then ask questions like 'Compare the costs across these invoices' or 'Summarize the main takeaways across all files.'",
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
        <div className="max-w-6xl mx-auto py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <FolderGit2 className="h-4 w-4" />
                        </div>
                        <h1 className="type-headline text-ink">
                            Multi-PDF Project Workspace
                        </h1>
                    </div>
                    <p className="type-subhead text-ink-subtle">
                        Ask questions across multiple documents at the same time. Compare files, summarize key points, and find answers in seconds.
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
                        className="button-primary h-8 text-xs font-medium gap-1.5 cursor-pointer rounded-[8px]"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Add PDF Files</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-12rem)] min-h-[550px]">
                {/* Left Column: Project Documents Shelf (4 cols) */}
                <div className="lg:col-span-4 hairline-card rounded-[12px] bg-surface-1 p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                            <div className="flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5 text-primary" />
                                <span className="type-eyebrow text-ink">
                                    Project Documents
                                </span>
                            </div>
                            <span className="type-caption font-mono text-ink-tertiary">
                                {activeDocsCount} of {documents.length} active
                            </span>
                        </div>

                        {documents.length === 0 ? (
                            <div className="paper-empty-sheet p-8 text-center space-y-2.5">
                                <div className="h-10 w-10 rounded-[8px] bg-surface-2 flex items-center justify-center border border-hairline mx-auto shadow-xs">
                                    <FileText className="h-5 w-5 text-ink-subtle" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-ink">
                                        No project documents loaded
                                    </p>
                                    <p className="type-caption text-ink-subtle mt-0.5 max-w-[200px] mx-auto">
                                        Upload 2 or more files to synthesize answers across all sources
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="button-secondary h-7 text-xs cursor-pointer mt-1 rounded-[6px]"
                                >
                                    Browse PDFs
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 subtle-scrollbar">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={cn(
                                            "p-3 rounded-[8px] border text-xs flex items-center justify-between gap-2 transition-all shadow-xs",
                                            doc.isActive
                                                ? "paper-sheet border-paper-border text-ink"
                                                : "border-hairline bg-surface-1 text-ink-tertiary opacity-60"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <input
                                                type="checkbox"
                                                checked={doc.isActive}
                                                onChange={() => toggleDocumentActive(doc.id)}
                                                className="rounded-[4px] accent-primary cursor-pointer h-3.5 w-3.5"
                                            />
                                            <div className="truncate">
                                                <p className="font-medium text-ink truncate text-xs">
                                                    {doc.name}
                                                </p>
                                                <p className="type-caption font-mono text-ink-subtle flex items-center gap-1.5 mt-0.5">
                                                    <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                                    <span>•</span>
                                                    {doc.isExtracting ? (
                                                        <span className="text-[#f2994a]">Extracting...</span>
                                                    ) : (
                                                        <span className="text-[#16a34a] font-medium flex items-center gap-0.5">
                                                            <CheckCircle2 className="h-2.5 w-2.5 inline" /> Ready
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeDocument(doc.id)}
                                            className="text-ink-tertiary hover:text-[#eb5757] cursor-pointer p-1 shrink-0 transition-colors"
                                            title="Remove from project"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Cross-Doc Prompts */}
                    <div className="pt-3 border-t border-hairline space-y-1.5">
                        <span className="type-eyebrow text-ink-subtle block">
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
                                    className="w-full text-left p-1.5 rounded-[6px] text-[11px] text-ink-subtle hover:text-ink hover:bg-surface-2 truncate cursor-pointer transition-colors block border border-transparent hover:border-hairline"
                                >
                                    ↳ {promptText}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Cross-Document Chat Feed (8 cols) */}
                <div className="lg:col-span-8 hairline-card rounded-[12px] bg-surface-1 flex flex-col justify-between overflow-hidden">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 subtle-scrollbar">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex gap-3 text-xs leading-relaxed max-w-[90%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-7 w-7 rounded-full flex items-center justify-center shrink-0 border mt-0.5 shadow-xs",
                                        m.role === 'user'
                                            ? "bg-primary text-white border-transparent"
                                            : "bg-surface-2 text-primary border-hairline"
                                    )}
                                >
                                    {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                                </div>

                                <div
                                    className={cn(
                                        "shadow-xs text-xs",
                                        m.role === 'user'
                                            ? "bg-primary text-white p-3.5 rounded-2xl rounded-br-xs whitespace-pre-wrap"
                                            : "bg-surface-2 text-ink border border-hairline p-4 rounded-2xl rounded-bl-xs"
                                    )}
                                >
                                    {m.role === 'assistant' ? (
                                        <PaperProse content={m.content} title="project-workspace-synthesis" />
                                    ) : (
                                        m.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {isSubmitting && (
                            <div className="flex gap-3 text-xs max-w-[88%]">
                                <div className="h-7 w-7 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>

                                <div className="p-3.5 rounded-[10px] border border-hairline bg-surface-2 flex items-center gap-2 text-ink-subtle">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
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
                        className="p-3 border-t border-hairline bg-surface-2 flex items-center gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={activeDocsCount > 0 ? `Ask across ${activeDocsCount} active documents...` : "Upload documents to begin asking questions..."}
                            disabled={activeDocsCount === 0 || isSubmitting}
                            className="h-10 text-xs bg-surface-1 border-hairline rounded-[8px]"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!input.trim() || activeDocsCount === 0 || isSubmitting}
                            className="button-primary h-10 px-4 text-xs font-medium gap-1.5 cursor-pointer shrink-0 rounded-[8px]"
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
