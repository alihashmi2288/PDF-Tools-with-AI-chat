"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OCRState {
    file: File | null;
    text: string;
    progress: number;
    status: string;
    isProcessing: boolean;
    copied: boolean;
}

interface MergeState {
    files: File[];
    mergedPdfUrl: string | null;
    isMerging: boolean;
}

interface EditState {
    file: File | null;
}

interface ImageToPdfState {
    files: File[];
    pdfUrl: string | null;
    isConverting: boolean;
}

interface GlobalToolContextType {
    ocr: OCRState;
    setOCR: (state: Partial<OCRState>) => void;
    merge: MergeState;
    setMerge: (state: Partial<MergeState>) => void;
    edit: EditState;
    setEdit: (state: Partial<EditState>) => void;
    imageToPdf: ImageToPdfState;
    setImageToPdf: (state: Partial<ImageToPdfState>) => void;
}

const GlobalToolContext = createContext<GlobalToolContextType | undefined>(undefined);

export function GlobalToolProvider({ children }: { children: ReactNode }) {
    const [ocr, setOCRState] = useState<OCRState>({
        file: null,
        text: "",
        progress: 0,
        status: "",
        isProcessing: false,
        copied: false
    });

    const [merge, setMergeState] = useState<MergeState>({
        files: [],
        mergedPdfUrl: null,
        isMerging: false
    });

    const [edit, setEditState] = useState<EditState>({
        file: null
    });

    const [imageToPdf, setImageToPdfState] = useState<ImageToPdfState>({
        files: [],
        pdfUrl: null,
        isConverting: false
    });

    const setOCR = (updates: Partial<OCRState>) => {
        setOCRState(prev => ({ ...prev, ...updates }));
    };

    const setMerge = (updates: Partial<MergeState>) => {
        setMergeState(prev => ({ ...prev, ...updates }));
    };

    const setEdit = (updates: Partial<EditState>) => {
        setEditState(prev => ({ ...prev, ...updates }));
    };

    const setImageToPdf = (updates: Partial<ImageToPdfState>) => {
        setImageToPdfState(prev => ({ ...prev, ...updates }));
    };

    return (
        <GlobalToolContext.Provider value={{ ocr, setOCR, merge, setMerge, edit, setEdit, imageToPdf, setImageToPdf }}>
            {children}
        </GlobalToolContext.Provider>
    );
}

export function useGlobalToolContext() {
    const context = useContext(GlobalToolContext);
    if (context === undefined) {
        throw new Error('useGlobalToolContext must be used within a GlobalToolProvider');
    }
    return context;
}
