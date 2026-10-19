"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePDFContext } from "@/context/PDFContext";
import { PaperProse } from "@/components/ui/paper-prose";

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
        <div className={cn("flex flex-col h-full border border-hairline rounded-[12px] overflow-hidden bg-surface-1 shadow-xs", className)}>
            {/* Header info */}
            <div className="px-4 py-2.5 border-b border-hairline bg-surface-2/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-[6px] bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <span className="type-mono-eyebrow text-[10px] text-ink font-semibold tracking-[0.4px]">
                        AI Document Assistant
                    </span>
                </div>
                <span className="type-mono-eyebrow text-[9px] text-ink-muted px-2 py-0.5 rounded-full bg-surface-2 border border-hairline">
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
                            <div className="h-7 w-7 rounded-full bg-surface-2 flex items-center justify-center shrink-0 border border-hairline mt-0.5 shadow-xs">
                                <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                        )}

                        <div
                            className={cn(
                                "text-xs leading-relaxed max-w-[85%]",
                                msg.role === "user"
                                    ? "bg-primary text-white font-normal shadow-xs px-4 py-2.5 rounded-2xl rounded-br-xs whitespace-pre-wrap"
                                    : "bg-surface-2 text-ink border border-hairline p-4 rounded-2xl rounded-bl-xs shadow-xs"
                            )}
                        >
                            {msg.role === "assistant" ? (
                                <PaperProse content={msg.content} title="ai-document-answer" />
                            ) : (
                                msg.content
                            )}
                        </div>

                        {msg.role === "user" && (
                            <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-[10px]">
                                U
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2.5 text-xs text-ink-subtle">
                        <div className="h-7 w-7 rounded-[8px] bg-surface-2 flex items-center justify-center shrink-0 border border-hairline">
                            <Bot className="h-3.5 w-3.5 text-primary animate-pulse" />
                        </div>
                        <div className="p-2.5 rounded-[10px] bg-surface-2 border border-hairline flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            <span className="type-mono-eyebrow text-[10px] text-ink-subtle">Reading your document...</span>
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
                            className="text-[11px] px-2.5 py-1 rounded-[6px] bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink transition-colors text-left cursor-pointer"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-hairline bg-surface-1">
                <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={context ? "Ask anything about this document..." : "Ask a question about your document..."}
                        disabled={isLoading}
                        className="flex-1 h-8.5 px-3 text-xs rounded-[8px] bg-surface-2 border border-hairline text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <Button 
                        type="submit" 
                        size="sm" 
                        disabled={isLoading || !input.trim()}
                        className="h-8.5 px-3 text-xs gap-1.5"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
