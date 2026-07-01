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
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a strict, standard ${language} compiler/interpreter.
Your task is to dry-run and simulate the exact terminal output of the following code.
Do not explain the code. Only provide the exact standard output (stdout) and standard error (stderr) that would be printed to the console.

Here is the source code:
\`\`\`${language}
${code}
\`\`\`

You must respond with ONLY a valid JSON object in the exact structure below, with no markdown formatting outside the JSON, and no additional text.
CRITICAL: You MUST properly double-escape ALL special characters in your output strings so that it parses as valid JSON. For example, backslashes must be \\\\, newlines must be \\n, quotes must be \\\".

{
  "output": "The exact simulated terminal output as a plain string. If there is an error, print the error message here."
}
`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = aiResponse.text;
    if (!responseText) {
      throw new Error("Empty response from AI Simulator");
    }

    const sanitizedText = responseText.replace(/[\u0000-\u0019]+/g, "");
    const parsedData = JSON.parse(sanitizedText);

    return NextResponse.json({
      output: `[AI Predicted Output]\n\n${parsedData.output}`,
      isFallback: true,
    });

  } catch (error: any) {
    console.error("Execution error:", error);
    
    let errorMessage = "Failed to execute code.";
    const errString = error.toString();
    
    if (errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("high demand")) {
      errorMessage = "The AI simulation engine is currently experiencing high demand. Please try again in a few seconds.";
    } else if (errString.includes("429") || errString.includes("Quota exceeded")) {
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
