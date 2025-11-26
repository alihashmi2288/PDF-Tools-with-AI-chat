"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
    role: "user" | "assistant";
    content: string;
}

interface PDFContextType {
    file: File | null;
    pdfText: string;
    messages: Message[];
    setFile: (file: File | null) => void;
    setPdfText: (text: string) => void;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export function PDFProvider({ children }: { children: ReactNode }) {
    const [file, setFile] = useState<File | null>(null);
    const [pdfText, setPdfText] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I can help you analyze your PDF documents. Upload a document to get started or ask me a general question." }
    ]);

    return (
        <PDFContext.Provider value={{ file, pdfText, messages, setFile, setPdfText, setMessages }}>
            {children}
        </PDFContext.Provider>
    );
}

export function usePDFContext() {
    const context = useContext(PDFContext);
    if (context === undefined) {
        throw new Error('usePDFContext must be used within a PDFProvider');
    }
    return context;
}
