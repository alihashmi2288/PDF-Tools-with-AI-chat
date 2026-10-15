import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini-client";

export async function POST(req: NextRequest) {
    try {
        const { text, targetLanguage } = await req.json();

        if (!text || !targetLanguage) {
            return NextResponse.json({ error: "Text and targetLanguage are required." }, { status: 400 });
        }

        const isRtl = ["urdu", "arabic", "hebrew", "persian", "farsi", "pashto"].includes(
            targetLanguage.toLowerCase().trim()
        );

        const prompt = `You are a professional multilingual document translator.
Translate the following document into ${targetLanguage}.
Maintain exact paragraph structures, headings, bullet points, numbers, and technical terminology.
Do not omit any sections or numbers.

ORIGINAL DOCUMENT:
${text.slice(0, 25000)}

Respond ONLY with valid JSON in this structure:
{
  "targetLanguage": "${targetLanguage}",
  "direction": "${isRtl ? 'rtl' : 'ltr'}",
  "title": "Translated document title or header",
  "translatedText": "Full translated document text with proper line breaks and paragraphs.",
  "paragraphs": [
    {
      "original": "Original paragraph snippet",
      "translated": "Translated paragraph"
    }
  ]
}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Translation API error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to translate document" },
            { status: 500 }
        );
    }
}
