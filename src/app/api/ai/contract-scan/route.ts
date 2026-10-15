import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini-client";

export async function POST(req: NextRequest) {
    try {
        const { originalText, revisedText, mode } = await req.json();

        let prompt = "";
        if (mode === "compare" && originalText && revisedText) {
            prompt = `You are an elite legal contract expert and risk auditor. 
Compare the following ORIGINAL CONTRACT version with the REVISED/COUNTERPARTY CONTRACT version.
Identify all modifications, added liabilities, hidden traps, changes to indemnification, altered dollar amounts/fees, and shifted deadlines.

ORIGINAL CONTRACT:
${originalText.slice(0, 15000)}

REVISED CONTRACT:
${revisedText.slice(0, 15000)}

Respond ONLY with valid JSON in this exact structure:
{
  "overallRiskScore": 65, // number from 0 (safest) to 100 (highest risk)
  "riskLevel": "High" | "Medium" | "Low",
  "executiveSummary": "Concise 2-3 sentence overview of major changes and threats.",
  "flaggedClauses": [
    {
      "title": "Clause name (e.g. Indemnification & Liability Limit)",
      "severity": "high" | "medium" | "low",
      "originalSnippet": "Exact or summarized text from original",
      "revisedSnippet": "Changed text in revision",
      "riskExplanation": "Why this change creates risk or exposes the user",
      "counterRecommendation": "Recommended negotiating counter-clause"
    }
  ],
  "favorableChanges": ["List of any changes that actually favor the user"],
  "checklistForCounsel": ["Key points to review with an attorney"]
}`;
        } else {
            prompt = `You are an elite legal contract expert and risk auditor.
Audit the following contract for hidden liabilities, unilateral termination rights, excessive penalty fees, IP assignment traps, and one-sided indemnity clauses.

CONTRACT TEXT:
${(originalText || revisedText || "").slice(0, 25000)}

Respond ONLY with valid JSON in this exact structure:
{
  "overallRiskScore": 55, // number from 0 to 100
  "riskLevel": "High" | "Medium" | "Low",
  "executiveSummary": "Concise 2-3 sentence audit summary.",
  "flaggedClauses": [
    {
      "title": "Clause name",
      "severity": "high" | "medium" | "low",
      "originalSnippet": "The clause text from the contract",
      "revisedSnippet": "",
      "riskExplanation": "Why this poses risk",
      "counterRecommendation": "Recommended safer language"
    }
  ],
  "favorableChanges": ["Standard or balanced protections found"],
  "checklistForCounsel": ["Key points to negotiate"]
}`;
        }

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        
        const text = result.response.text();
        const data = JSON.parse(text);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Contract scan API error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to analyze contract" },
            { status: 500 }
        );
    }
}
