import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini-client";

export async function POST(req: NextRequest) {
    try {
        const { text, count = 10, difficulty = "intermediate" } = await req.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Study text is required." }, { status: 400 });
        }

        const prompt = `You are a world-class academic tutor and test preparation educator.
From the provided study material, generate:
1. ${count} high-yield concept Flashcards (front question + back clear answer & memory hook).
2. 5 challenging multiple-choice Quiz questions with 4 options, the correct answer index (0-3), and an explanation.
3. A concise Executive Study Guide summarizing the top 5 essential takeaways and definitions.

STUDY MATERIAL:
${text.slice(0, 25000)}

DIFFICULTY LEVEL: ${difficulty}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Study Guide Subject / Topic",
  "summary": "Brief 2-3 sentence overview of the topic.",
  "flashcards": [
    {
      "id": 1,
      "front": "Question, prompt, or term",
      "back": "Clear, concise answer and key takeaway",
      "concept": "Topic category or tag"
    }
  ],
  "quiz": [
    {
      "id": 1,
      "question": "Scenario or concept question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0, // integer 0 to 3
      "explanation": "Why this answer is correct and why the alternatives are false"
    }
  ],
  "studyGuideKeyPoints": [
    "Core takeaway 1",
    "Core takeaway 2",
    "Core takeaway 3",
    "Core takeaway 4",
    "Core takeaway 5"
  ]
}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        // Pre-generate Anki TSV export string (front \t back \n)
        if (data.flashcards && Array.isArray(data.flashcards)) {
            data.ankiTsv = data.flashcards
                .map((f: any) => `${f.front.replace(/\t/g, ' ')}\t${f.back.replace(/\t/g, ' ')}\t${f.concept || ''}`)
                .join('\n');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Study AI generator error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate study materials" },
            { status: 500 }
        );
    }
}
