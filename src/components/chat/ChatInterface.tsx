"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles, Loader2 } from "lucide-react";
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
        <div className={cn("flex flex-col h-full border border-border rounded-xl overflow-hidden bg-card shadow-xs", className)}>
            {/* Header info */}
            <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-[4px] bg-secondary flex items-center justify-center border border-border">
                        <Sparkles className="h-3 w-3 text-foreground" />
                    </div>
                    <span className="type-mono-eyebrow text-[10px] text-foreground font-semibold">
                        AI Document Assistant
                    </span>
                </div>
                <span className="type-mono-eyebrow text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-[4px] bg-card border border-border">
                    Instant AI Answers
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
                            <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center shrink-0 border border-border mt-0.5">
                                <Bot className="h-3.5 w-3.5 text-foreground" />
                            </div>
                        )}

                        <div
                            className={cn(
                                "rounded-xl px-4 py-2.5 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap",
                                msg.role === "user"
                                    ? "bg-[#171717] dark:bg-white text-white dark:text-black font-medium shadow-xs"
                                    : "bg-secondary text-foreground border border-border"
                            )}
                        >
                            {msg.content}
                        </div>

                        {msg.role === "user" && (
                            <div className="h-7 w-7 rounded-[6px] bg-[#171717] dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-[10px]">
                                U
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <div className="h-7 w-7 rounded-[6px] bg-secondary flex items-center justify-center shrink-0 border border-border">
                            <Bot className="h-3.5 w-3.5 text-foreground animate-pulse" />
                        </div>
                        <div className="p-2.5 rounded-xl bg-secondary border border-border flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            <span className="type-mono-eyebrow text-[10px] text-muted-foreground">Reading your document...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Suggested Chips */}
            {messages.length <= 2 && context && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {suggestedPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleSubmit(undefined, prompt)}
                            className="text-[11px] px-2.5 py-1 rounded-[6px] bg-secondary hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card">
                <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={context ? "Ask anything about this document..." : "Ask a question about your document..."}
                        disabled={isLoading}
                        className="flex-1 h-8 px-3 text-xs rounded-[6px] bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-all"
                    />
                    <Button 
                        type="submit" 
                        size="sm" 
                        disabled={isLoading || !input.trim()}
                        className="h-8 px-3 text-xs gap-1.5"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
