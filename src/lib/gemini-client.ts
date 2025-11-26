import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function chatWithPDF(text: string, prompt: string) {
    const result = await model.generateContent([
        `Context: ${text}`,
        `User Question: ${prompt}`
    ]);
    return result.response.text();
}
