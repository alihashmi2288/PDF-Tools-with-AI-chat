"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf/PDFUploader";
import { Button } from "@/components/ui/button";
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { 
    GraduationCap, 
    Download, 
    Loader2, 
    Sparkles, 
    CheckCircle2, 
    RotateCcw, 
    ChevronLeft, 
    ChevronRight, 
    HelpCircle, 
    BookOpen, 
    Share2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
    id: number;
    front: string;
    back: string;
    concept?: string;
}

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface StudyResult {
    title: string;
    summary: string;
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
    studyGuideKeyPoints: string[];
    ankiTsv?: string;
}

export default function StudyAiPage() {
    const [file, setFile] = useState<File | null>(null);
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [cardCount, setCardCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [studyData, setStudyData] = useState<StudyResult | null>(null);

    // Active Study Mode Tab
    const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'guide'>('flashcards');

    // Flashcard UI State
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Quiz UI State
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setStudyData(null);
    };

    const handleGenerate = async () => {
        if (!file) return;
        setIsGenerating(true);
        setStudyData(null);
        setSelectedAnswers({});
        setRevealedAnswers({});

        try {
            const text = await extractTextFromPDF(file);
            const res = await fetch("/api/ai/study", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    count: cardCount,
                    difficulty,
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to generate study materials");
            }

            const data: StudyResult = await res.json();
            setStudyData(data);
            setCurrentCardIndex(0);
            setIsFlipped(false);
        } catch (err: any) {
            console.error("Study generation failed:", err);
            alert("Failed to generate materials: " + (err?.message || "Unknown error"));
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadAnkiDeck = () => {
        if (!studyData?.ankiTsv) return;
        const blob = new Blob([studyData.ankiTsv], { type: 'text/tab-separated-values;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file?.name.replace(/\.pdf$/i, '')}_anki_cards.tsv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadStudyGuideTxt = () => {
        if (!studyData) return;
        let content = `# ${studyData.title || "Study Guide"}\n\n`;
        content += `## Summary\n${studyData.summary}\n\n`;
        content += `## Key Takeaways & Definitions\n`;
        studyData.studyGuideKeyPoints.forEach((pt, i) => {
            content += `${i + 1}. ${pt}\n`;
        });
        content += `\n## Flashcards\n`;
        studyData.flashcards.forEach((f, i) => {
            content += `Q${i + 1}: ${f.front}\nA: ${f.back}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file?.name.replace(/\.pdf$/i, '')}_study_guide.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleSelectOption = (questionId: number, optionIdx: number) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
        setRevealedAnswers(prev => ({ ...prev, [questionId]: true }));
    };

    const currentCard = studyData?.flashcards[currentCardIndex];

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            <div className="space-y-1.5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                        <GraduationCap className="h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        AI Flashcard &amp; Quiz Generator
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Convert lecture slides, chapters, and notes into interactive 3D flip flashcards, Anki-ready decks, multiple-choice quizzes, and study guides.
                </p>
            </div>

            {!file ? (
                <PDFUploader
                    onFileSelect={handleFileSelect}
                    title="Drop lecture slides or textbook PDF here"
                    subtitle="Transforms long readings into high-yield active recall flashcards"
                />
            ) : (
                <div className="space-y-6">
                    {/* Controls Card */}
                    <div className="p-5 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                            <span className="font-semibold text-xs text-foreground truncate max-w-sm">
                                {file.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground"
                                onClick={() => {
                                    setFile(null);
                                    setStudyData(null);
                                }}
                            >
                                Change Document
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-foreground">
                                    Difficulty Level:
                                </span>
                                <div className="grid grid-cols-3 gap-1 bg-secondary/30 p-1 rounded-lg border border-border/50 text-xs">
                                    {(['beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                                        <button
                                            key={diff}
                                            type="button"
                                            onClick={() => setDifficulty(diff)}
                                            className={cn(
                                                "py-1 capitalize rounded-md transition-all cursor-pointer font-medium text-center",
                                                difficulty === diff
                                                    ? "bg-foreground text-background font-semibold shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col justify-end">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="h-9 text-xs font-semibold gap-2 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            <span>Synthesizing Flashcards &amp; Quizzes...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-3.5 w-3.5" />
                                            <span>Generate Flashcards &amp; Quiz</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Results Interface */}
                    {studyData && (
                        <div className="space-y-5">
                            {/* Tabs Ribbon */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
                                <div className="flex flex-wrap gap-1.5 p-1 rounded-full bg-surface-1 border border-hairline max-w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('flashcards')}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                                            activeTab === 'flashcards'
                                                ? "bg-surface-2 text-ink border border-hairline shadow-xs font-semibold"
                                                : "text-ink-subtle hover:text-ink hover:bg-surface-2/50"
                                        )}
                                    >
                                        Flashcards ({studyData.flashcards.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('quiz')}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                                            activeTab === 'quiz'
                                                ? "bg-surface-2 text-ink border border-hairline shadow-xs font-semibold"
                                                : "text-ink-subtle hover:text-ink hover:bg-surface-2/50"
                                        )}
                                    >
                                        Practice Quiz ({studyData.quiz.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('guide')}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                                            activeTab === 'guide'
                                                ? "bg-surface-2 text-ink border border-hairline shadow-xs font-semibold"
                                                : "text-ink-subtle hover:text-ink hover:bg-surface-2/50"
                                        )}
                                    >
                                        Study Summary
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadAnkiDeck}
                                        className="button-secondary h-8 text-xs gap-1.5 cursor-pointer rounded-[8px]"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Export to Anki (.tsv)</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={downloadStudyGuideTxt}
                                        className="button-primary h-8 text-xs gap-1.5 cursor-pointer rounded-[8px]"
                                    >
                                        <BookOpen className="h-3.5 w-3.5" />
                                        <span>Download Guide</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Tab 1: Interactive 3D Flip Flashcards (Paper Index Card) */}
                            {activeTab === 'flashcards' && currentCard && (
                                <div className="space-y-4 max-w-xl mx-auto">
                                    <div className="flex items-center justify-between text-xs text-ink-subtle">
                                        <span className="font-mono">
                                            Card {currentCardIndex + 1} of {studyData.flashcards.length}
                                        </span>
                                        <span className="paper-citation-pill text-[10px]">
                                            {currentCard.concept || "Concept"}
                                        </span>
                                    </div>

                                    {/* Flashcard Box with Flip on Click: Paper Index Card Styling */}
                                    <div
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        className={cn(
                                            "paper-sheet paper-sheet-stacked min-h-[260px] p-8 rounded-[12px] border border-paper-border transition-all duration-300 flex flex-col justify-between cursor-pointer text-center select-none shadow-md group",
                                            isFlipped
                                                ? "border-primary/40 bg-surface-2"
                                                : "hover:border-hairline-strong"
                                        )}
                                    >
                                        <div className="text-[10px] uppercase tracking-wider font-mono font-medium text-ink-subtle flex items-center justify-center gap-1.5">
                                            <RotateCcw className="h-3 w-3" />
                                            <span>{isFlipped ? "Answer & Key Takeaway" : "Click card to flip"}</span>
                                        </div>

                                        <div className="my-auto py-4">
                                            <p className={cn(
                                                "leading-relaxed",
                                                isFlipped ? "text-sm text-ink-muted font-normal" : "text-base font-semibold text-ink"
                                            )}>
                                                {isFlipped ? currentCard.back : currentCard.front}
                                            </p>
                                        </div>

                                        <p className="text-[11px] text-ink-subtle group-hover:text-ink transition-colors">
                                            {isFlipped ? "Click again to view question" : "Tap anywhere to reveal answer"}
                                        </p>
                                    </div>

                                    {/* Navigation buttons */}
                                    <div className="flex items-center justify-between pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCurrentCardIndex(prev => Math.max(0, prev - 1));
                                                setIsFlipped(false);
                                            }}
                                            disabled={currentCardIndex === 0}
                                            className="h-8 text-xs gap-1.5 cursor-pointer"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                            <span>Previous</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsFlipped(!isFlipped)}
                                            className="h-8 text-xs cursor-pointer"
                                        >
                                            Flip Card
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCurrentCardIndex(prev => Math.min(studyData.flashcards.length - 1, prev + 1));
                                                setIsFlipped(false);
                                            }}
                                            disabled={currentCardIndex === studyData.flashcards.length - 1}
                                            className="h-8 text-xs gap-1.5 cursor-pointer"
                                        >
                                            <span>Next</span>
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Interactive Multiple-Choice Quiz (Paper Exam Cards) */}
                            {activeTab === 'quiz' && (
                                <div className="space-y-4">
                                    {studyData.quiz.map((q, qIdx) => {
                                        const selected = selectedAnswers[q.id];
                                        const isRevealed = revealedAnswers[q.id];

                                        return (
                                            <div
                                                key={q.id}
                                                className="paper-sheet p-5 rounded-[12px] border border-paper-border space-y-3.5 shadow-xs"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <span className="h-5 w-5 rounded-[6px] bg-surface-2 text-ink border border-hairline flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                                                        {qIdx + 1}
                                                    </span>
                                                    <h3 className="font-semibold text-xs sm:text-sm text-ink leading-snug">
                                                        {q.question}
                                                    </h3>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                    {q.options.map((opt, optIdx) => {
                                                        const isThisSelected = selected === optIdx;
                                                        const isThisCorrect = q.correctIndex === optIdx;

                                                        let btnStyle = "border-hairline bg-surface-2/60 text-ink hover:bg-surface-2 hover:border-hairline-strong";
                                                        if (isRevealed) {
                                                            if (isThisCorrect) {
                                                                btnStyle = "border-[#16a34a] bg-[#16a34a]/15 text-[#16a34a] font-semibold";
                                                            } else if (isThisSelected && !isThisCorrect) {
                                                                btnStyle = "border-[#eb5757] bg-[#eb5757]/15 text-[#eb5757] line-through";
                                                            }
                                                        }

                                                        return (
                                                            <button
                                                                key={optIdx}
                                                                type="button"
                                                                onClick={() => handleSelectOption(q.id, optIdx)}
                                                                className={cn(
                                                                    "p-3 rounded-[8px] border text-left text-xs transition-all cursor-pointer flex items-center gap-2",
                                                                    btnStyle
                                                                )}
                                                            >
                                                                <span className="font-mono text-ink-subtle font-bold text-[11px]">
                                                                    {String.fromCharCode(65 + optIdx)}.
                                                                </span>
                                                                <span className="flex-1">{opt}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {isRevealed && (
                                                    <div className="p-3 rounded-[8px] bg-surface-2/80 border border-hairline text-xs leading-relaxed text-ink-subtle mt-2 border-l-2 border-l-primary">
                                                        <strong className="text-ink block mb-0.5 font-semibold">
                                                            {selected === q.correctIndex ? "✓ Correct Answer" : "✗ Incorrect"}
                                                        </strong>
                                                        {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Tab 3: Study Summary (Paper Editorial Prose) */}
                            {activeTab === 'guide' && (
                                <div className="paper-sheet p-6 rounded-[12px] border border-paper-border space-y-5 shadow-xs text-xs">
                                    <div className="space-y-1.5 border-b border-hairline pb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="paper-citation-pill text-[9px]">
                                                Document Synthesis
                                            </span>
                                            <span className="type-mono-eyebrow text-[10px] text-ink-subtle">
                                                Generated from source
                                            </span>
                                        </div>
                                        <h2 className="type-card-title text-ink font-semibold">
                                            {studyData.title || "Executive Study Guide"}
                                        </h2>
                                        <p className="paper-prose text-xs text-ink-muted leading-relaxed">
                                            {studyData.summary}
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-1">
                                        <h3 className="font-semibold text-xs text-ink uppercase tracking-wider font-mono">
                                            Core Concepts &amp; Key Takeaways:
                                        </h3>
                                        <ul className="paper-prose space-y-2 list-disc pl-5 text-ink-muted leading-relaxed">
                                            {studyData.studyGuideKeyPoints.map((pt, idx) => (
                                                <li key={idx} className="pl-1">
                                                    <span className="text-ink">{pt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
