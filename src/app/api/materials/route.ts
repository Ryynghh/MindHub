// src/app/api/materials/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskName, parentName } = body;

    if (!taskName) {
      return NextResponse.json(
        { error: "Task name is required" },
        { status: 400 }
      );
    }

    const context = parentName
      ? `This is a subtask "${taskName}" under the parent release/module "${parentName}".`
      : `This is a main release/module called "${taskName}".`;

    const systemInstruction = `
You are Megi AI, a learning materials expert for the MindHub platform.
Your job is to generate structured, comprehensive learning materials for a specific task or subtask in a user's workspace roadmap.

${context}

Generate learning materials in the following JSON format. Make the content rich, educational, and actionable:
{
  "title": "<The topic title>",
  "summary": "<A 2-3 sentence overview of what this topic covers and why it matters>",
  "objectives": ["<Learning objective 1>", "<Learning objective 2>", "<Learning objective 3>"],
  "keyConcepts": [
    {
      "term": "<Concept name>",
      "definition": "<Clear, concise definition with an example if helpful>"
    }
  ],
  "steps": [
    {
      "title": "<Step title>",
      "content": "<Detailed explanation of 3-5 sentences>"
    }
  ],
  "resources": [
    {
      "title": "<YouTube Video Title or Topic to Search>",
      "url": "https://www.youtube.com/results?search_query=<Topic+To+Search>",
      "type": "video"
    }
  ],
  "tips": ["<Practical tip 1>", "<Practical tip 2>"]
}

Rules:
- Respond ONLY with valid JSON, no extra text or markdown.
- Generate 3-5 key concepts, 3-5 steps, 3-5 resources, and 2-3 tips.
- For resources, you MUST ONLY provide YouTube links (type MUST be "video").
- To ensure URLs actually work, you MUST use YouTube search URLs for the url field, for example: "https://www.youtube.com/results?search_query=react+hooks+tutorial". Do NOT generate fake or hallucinated youtube.com/watch URLs.
- Write in a mix of Bahasa Indonesia and English (technical terms in English, explanations can be in Bahasa Indonesia).
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(
      `Generate comprehensive learning materials for: "${taskName}"${parentName ? ` (part of: "${parentName}")` : ""}`
    );
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown code fences
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    try {
      const materials = JSON.parse(text);
      return NextResponse.json({ materials }, { status: 200 });
    } catch (parseError) {
      console.error("Failed to parse materials JSON:", parseError, text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Materials API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate materials" },
      { status: 500 }
    );
  }
}
