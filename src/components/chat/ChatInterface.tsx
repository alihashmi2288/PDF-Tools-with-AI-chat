"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePDFContext } from "@/context/PDFContext";

interface ChatInterfaceProps {
    context?: string;
    className?: string;
}

export function ChatInterface({ context, className }: ChatInterfaceProps) {
    const { messages, setMessages } = usePDFContext();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
        if (e) e.preventDefault();
        const promptToSend = (customPrompt || input).trim();
        if (!promptToSend || isLoading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: promptToSend }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: promptToSend, context }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to send message");
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response },
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedPrompts = [
        "Summarize document into 3 key takeaways",
        "Extract critical dates & deadlines",
        "Identify potential risks or liabilities",
    ];

    return (
        <div className={cn("flex flex-col h-full border border-border/70 rounded-xl overflow-hidden bg-card shadow-xs", className)}>
            {/* Header info */}
            <div className="px-4 py-2.5 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Sparkles className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Document Assistant</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                    Gemini
                </span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 subtle-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex w-full items-start gap-2.5",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        {msg.role === "assistant" && (
                            <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/60 mt-0.5">
                                <Bot className="h-3.5 w-3.5 text-foreground" />
                            </div>
                        )}

                        <div
                            className={cn(
                                "rounded-xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap",
                                msg.role === "user"
                                    ? "bg-foreground text-background font-medium shadow-xs"
                                    : "bg-secondary/60 text-foreground border border-border/50"
                            )}
                        >
                            {msg.content}
                        </div>

                        {msg.role === "user" && (
                            <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-[10px]">
                                U
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/60">
                            <Bot className="h-3.5 w-3.5 text-foreground animate-pulse" />
                        </div>
                        <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40 flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            <span className="font-mono text-[11px]">Analyzing document context...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Suggested Chips when message count is low */}
            {messages.length <= 2 && context && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {suggestedPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleSubmit(undefined, prompt)}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-secondary/80 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-border/60 bg-background/50">
                <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={context ? "Ask questions about this PDF..." : "Ask a general document question..."}
                        disabled={isLoading}
                        className="flex-1 h-9 px-3 text-xs rounded-lg bg-secondary/50 border border-border/70 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    />
                    <Button 
                        type="submit" 
                        size="sm" 
                        disabled={isLoading || !input.trim()}
                        className="h-9 px-3 text-xs gap-1.5"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
