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
    
    const targetLangsStr = targetLangs.join(', ');

    const prompt = `You are an expert, world-class programmer.
Your task is to translate the following code from ${sourceLang} to the following target languages: ${targetLangsStr}.
You MUST follow these strict rules:
1. Provide the absolute simplest, most concise, and idiomatic form of the code for each target language.
2. Maintain the exact same variable names and function names as the source code.
3. DO NOT include ANY comments in the translated code. Strip all original comments and do not add new ones.
4. Keep all contextual details, reasoning, and explanations strictly within the "explanation" JSON field.

Here is the source code:
\`\`\`${sourceLang}
${code}
\`\`\`

You must respond with ONLY a valid JSON object in the exact structure below, with no markdown formatting outside the JSON, and no additional text.

{
  "translations": {
    "targetLanguage1": "The simplest, comment-free translated code in target language 1 as a plain string",
    "targetLanguage2": "The simplest, comment-free translated code in target language 2 as a plain string (if requested)"
  },
  "explanation": "A concise explanation of the syntax changes, library replacements, data structures, and memory model differences introduced during this translation."
}

Note: The keys in the "translations" object MUST exactly match the requested target languages: ${targetLangsStr}.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      translations: parsedData.translations,
      explanation: parsedData.explanation,
    });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during translation" },
      { status: 500 }
    );
  }
}
