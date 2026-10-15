import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini-client";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Document text is required." }, { status: 400 });
        }

        const prompt = `You are a financial accounting data extraction AI.
Extract all structured data, line items, and totals from this invoice, receipt, or bank statement.

DOCUMENT TEXT:
${text.slice(0, 25000)}

Respond ONLY with valid JSON matching this exact structure:
{
  "vendor": {
    "name": "Vendor or Company Name",
    "address": "Vendor Address or empty",
    "email": "Email or empty",
    "taxId": "VAT / Tax / Registration ID or empty"
  },
  "customer": {
    "name": "Billed to Name or Client",
    "address": "Client address or empty"
  },
  "invoiceDetails": {
    "invoiceNumber": "Invoice / Reference Number",
    "invoiceDate": "YYYY-MM-DD or as written",
    "dueDate": "YYYY-MM-DD or as written",
    "currency": "USD, EUR, GBP, etc."
  },
  "lineItems": [
    {
      "id": 1,
      "description": "Item or Service description",
      "quantity": 1,
      "unitPrice": 100.00,
      "taxRate": "10%",
      "total": 100.00
    }
  ],
  "totals": {
    "subtotal": 100.00,
    "taxAmount": 10.00,
    "discount": 0.00,
    "shipping": 0.00,
    "grandTotal": 110.00
  }
}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Invoice extraction API error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to extract invoice data" },
            { status: 500 }
        );
    }
}
