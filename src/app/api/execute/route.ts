import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const PISTON_LANGUAGE_MAP: Record<string, string> = {
  cpp: "c++",
  python: "python",
  java: "java",
  javascript: "javascript",
  typescript: "typescript",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  kotlin: "kotlin",
  swift: "swift",
};

export async function POST(req: NextRequest) {
  try {
    const { language, code } = await req.json();

    if (!language || !code) {
      return NextResponse.json(
        { error: "Missing required fields: language or code" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Execution service is offline (GEMINI_API_KEY missing)." },
        { status: 500 }
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: "Cloudflare API credentials missing." }, { status: 500 });
    }

    const systemPrompt = `You are a highly advanced code execution simulator. You do not explain code. You do not talk.
Your ONLY job is to look at the provided code and simulate EXACTLY what would be printed to the standard output (STDOUT) if this code were executed in a real environment.
If there is a compilation error or syntax error, output the likely error message.
Otherwise, output the exact terminal output. Do NOT wrap the output in markdown code blocks. Give raw text only.`;

    const userPrompt = `Language: ${language}
Code:
${code}

Simulate the STDOUT.`;

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

    const outputText = data.result?.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      output: outputText.trim(),
    });

  } catch (error: any) {
    console.error("Execution error:", error);
    
    let errorMessage = "Failed to execute code.";
    const errString = error.toString();
    
    if (errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("high demand") || errString.includes("offline")) {
      errorMessage = "The AI simulation engine is currently experiencing high demand. Please try again in a few seconds.";
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
