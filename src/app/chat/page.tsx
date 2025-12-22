"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { usePDFContext } from "@/context/PDFContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ChatPage() {
    const { file, pdfText } = usePDFContext();

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Chat Assistant</h1>
                <p className="text-muted-foreground">
                    Ask questions about your documents or get general assistance.
                </p>

                {!file && (
                    <div className="flex flex-col gap-4 p-6 border rounded-lg bg-muted/30 mt-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Get Started</h3>
                            <p className="text-sm text-muted-foreground">
                                To chat with AI about your documents, please upload a PDF first.
                            </p>
                        </div>
                        <Button asChild className="w-fit">
                            <Link href="/documents">
                                Upload PDF in View PDF
                            </Link>
                        </Button>
                    </div>
                )}
                {file && (
                    <div className="p-4 border rounded-lg bg-muted/50 mt-4">
                        <p className="font-medium">Chatting with: {file.name}</p>
                    </div>
                )}
            </div>
            <ChatInterface context={pdfText} />
        </div>
    );
}
