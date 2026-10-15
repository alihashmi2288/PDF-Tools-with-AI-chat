import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini-client";

export async function POST(req: NextRequest) {
    try {
        const { message, documents } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message prompt is required." }, { status: 400 });
        }

        let contextString = "";
        if (Array.isArray(documents) && documents.length > 0) {
            // Allocate context fairly across documents (up to 6,000 characters per document)
            const maxPerDoc = Math.floor(25000 / Math.max(1, documents.length));
            contextString = documents.map((doc: { name: string; text: string }, idx: number) => {
                const excerpt = (doc.text || "").slice(0, maxPerDoc);
                return `=== DOCUMENT ${idx + 1}: "${doc.name}" ===\n${excerpt}\n`;
            }).join("\n");
        }

        const prompt = `You are a cross-document analysis intelligence.
You have access to ${documents?.length || 0} loaded documents in the user's workspace.

USER QUERY:
${message}

LOADED DOCUMENTS CONTEXT:
${contextString}

INSTRUCTIONS:
1. Provide a comprehensive, structured response comparing or synthesizing information across the documents.
2. Whenever stating a fact or quote, include explicit citation brackets referencing the source document, e.g. [Vendor_A.pdf] or [Research_Q3.pdf].
3. If documents contradict each other or have differences (e.g. conflicting prices, dates, terms), explicitly contrast them in a clear bulleted breakdown.
4. If the documents do not contain the answer, state that clearly while answering general knowledge.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return NextResponse.json({ response: responseText });
    } catch (error: any) {
        console.error("Multi-chat API error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate multi-document answer" },
            { status: 500 }
        );
    }
}
