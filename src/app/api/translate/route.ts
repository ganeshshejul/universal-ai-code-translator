import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { sourceLang, targetLangs, code } = await req.json();

    if (!sourceLang || !targetLangs || !Array.isArray(targetLangs) || targetLangs.length === 0 || !code) {
      return NextResponse.json(
        { error: "Missing required fields: sourceLang, targetLangs (array), or code" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    
    if (!code || !sourceLang || !targetLangs || targetLangs.length === 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI programming assistant.
The user will provide code in ${sourceLang}.
You must translate it to the following target language(s): ${targetLangs.join(" and ")}.

Output format rules:
1. Wrap each translated code block precisely in XML tags like this:
<translation lang="targetLanguage">
// code goes here
</translation>

2. After providing the translations, provide a brief markdown explanation wrapped in:
<explanation>
Explanation goes here
</explanation>

Do not include backticks around the XML blocks. Give ONLY the XML blocks and the explanation block. Provide the simplest code possible, with minimal comments.`;

    const userPrompt = `Source Language: ${sourceLang}
Target Languages: ${targetLangs.join(", ")}
Source Code:
${code}`;

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: "Cloudflare API credentials missing." }, { status: 500 });
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/moonshotai/kimi-k2.7-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Cloudflare API Error:", data);
      throw new Error(data.errors?.[0]?.message || "Cloudflare API request failed");
    }

    const responseText = data.result?.choices?.[0]?.message?.content || "";

    const translations: Record<string, string> = {};
    for (const targetLang of targetLangs) {
      const regex = new RegExp(`<translation lang="${targetLang}">\\s*([\\s\\S]*?)\\s*<\\/translation>`);
      const match = responseText.match(regex);
      if (match) {
        translations[targetLang] = match[1];
      }
    }

    const explanationRegex = /<explanation>\s*([\s\S]*?)\s*<\/explanation>/;
    const explanationMatch = responseText.match(explanationRegex);
    const explanation = explanationMatch ? explanationMatch[1] : "No explanation provided.";

    if (Object.keys(translations).length === 0) {
      console.error("Parse failed. Raw response:", responseText);
      throw new Error("Failed to parse the translation output correctly.");
    }

    return NextResponse.json({
      translations,
      explanation,
    });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    
    let errorMessage = "Failed to translate code.";
    const errString = error.toString();
    
    if (errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("high demand") || errString.includes("offline")) {
      errorMessage = "The AI engine is currently experiencing high demand. Please wait a moment and try again.";
    } else if (errString.includes("429") || errString.includes("Quota exceeded") || errString.includes("rate limit")) {
      errorMessage = "Free API quota exceeded. Please try again later.";
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
