import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini-client";

export async function POST(req: NextRequest) {
    try {
        const { message, context } = await req.json();

        const prompt = context
            ? `Context from PDF: ${context}\n\nUser Question: ${message}`
            : message;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate response" },
            { status: 500 }
        );
    }
}
