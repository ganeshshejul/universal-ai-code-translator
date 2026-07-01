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

Here is the source code:
\`\`\`${sourceLang}
${code}
\`\`\`

You MUST respond using EXACTLY the following XML-style format. Do not use JSON. Do not include markdown code blocks inside the translation tags.

<translation lang="targetLanguage1">
The simplest, comment-free translated code here
</translation>

<translation lang="targetLanguage2">
The simplest, comment-free translated code here
</translation>

<explanation>
A concise explanation of the syntax changes, library replacements, data structures, and memory model differences introduced during this translation.
</explanation>

Note: The "lang" attribute MUST exactly match the requested target languages: ${targetLangsStr}.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      // Removed JSON responseMimeType to allow raw text
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    // Parse the XML-style tags manually to avoid JSON escaping issues
    const translations: Record<string, string> = {};
    const translationRegex = /<translation lang="([^"]+)">\s*([\s\S]*?)\s*<\/translation>/g;
    let match;
    while ((match = translationRegex.exec(responseText)) !== null) {
      const lang = match[1];
      const translatedCode = match[2];
      translations[lang] = translatedCode;
    }

    const explanationRegex = /<explanation>\s*([\s\S]*?)\s*<\/explanation>/;
    const explanationMatch = responseText.match(explanationRegex);
    const explanation = explanationMatch ? explanationMatch[1] : "No explanation provided.";

    if (Object.keys(translations).length === 0) {
      console.error("Failed to parse AI response:", responseText);
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
    
    if (errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("high demand")) {
      errorMessage = "The AI engine is currently experiencing high demand. Please wait a moment and try again.";
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
