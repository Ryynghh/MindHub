// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { templates, generateRoadmapData } from "@/config/templates-data";
import { createWorkspaceFromTemplate } from "@/app/(dashboard)/actions/workspace";

// Inisialisasi SDK dengan API Key dari environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // Buat prompt sistem agar AI tahu daftar template dan format command yang harus dikeluarkan
    const systemInstruction = `
You are Megi AI, a helpful assistant for MindHub.
You can help users learn IT topics or automatically create learning workspaces for them.

Here are the available workspace templates you can create:
${templates.map((t) => `- ID: ${t.id} | Title: ${t.title}`).join("\n")}

If the user explicitly asks you to create a workspace or a roadmap for one of these PREDEFINED topics (e.g. "buatkan aku workspace tentang web dev", "create a web dev workspace"), you MUST reply with a friendly confirmation message AND output exactly this special command at the very end of your response:
[CREATE_WORKSPACE: id]
(Replace 'id' with the matching template ID, e.g. [CREATE_WORKSPACE: t1]).

HOWEVER, if the user asks to create a workspace/roadmap for a completely DYNAMIC or NEW topic that is NOT in the template list (for example "buatkan workspace untuk matematika kelas 12", "create a workspace for learning cooking", etc.), you MUST dynamically research and generate a comprehensive 3-4 week learning schedule for it.
To do this, reply with a friendly confirmation message, and at the very end of your response, output a JSON block wrapped in [DYNAMIC_WORKSPACE]...[/DYNAMIC_WORKSPACE] tags, strictly following this structure:
[DYNAMIC_WORKSPACE]
{
  "title": "<The generated title of the topic>",
  "description": "<A short description of the topic>",
  "roadmap": [
    {
      "name": "Week 1: <Topic Name>",
      "startOffset": 0,
      "duration": 7,
      "children": [
        { "name": "Day 1-2: <Subtopic>", "startOffset": 0, "duration": 2 },
        { "name": "Day 3-4: <Subtopic>", "startOffset": 2, "duration": 2 }
      ]
    }
  ]
}
[/DYNAMIC_WORKSPACE]

Note for startOffset and duration: They are in days. A week has duration 7. Week 1 starts at offset 0, Week 2 starts at offset 7. The children startOffsets should be relative to the beginning of the entire roadmap (e.g. Week 1 Day 1 is 0, Week 2 Day 1 is 7).
Only output these commands if the user wants to CREATE the workspace. If they just ask about what web dev is, just explain normally without the command.
`;

    // Menggunakan model Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });

    // Memformat history percakapan sesuai standar Gemini SDK
    const formattedHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Memulai sesi chat dengan membawa konteks percakapan sebelumnya
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Mengirim pesan baru dan menunggu balasan
    const result = await chat.sendMessage(message);
    const response = await result.response;
    let text = response.text();

    let redirectUrl = null;

    // 1. Deteksi command pembuatan workspace PREDEFINED
    const createMatch = text.match(/\[CREATE_WORKSPACE:\s*(t\d+)\]/i);
    if (createMatch) {
      const templateId = createMatch[1].toLowerCase();
      text = text.replace(createMatch[0], "").trim();
      
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const roadmapData = generateRoadmapData(templateId);
        const wsResult = await createWorkspaceFromTemplate(
          template.title,
          template.description,
          roadmapData
        );
        
        if (wsResult.success) {
           redirectUrl = `/workspace/${wsResult.workspaceId}`;
        } else {
           text += "\n\n*(Sistem): Maaf, gagal membuat workspace otomatis karena: " + wsResult.error + "*";
        }
      }
    }

    // 2. Deteksi command pembuatan workspace DYNAMIC
    const dynamicMatch = text.match(/\[DYNAMIC_WORKSPACE\]([\s\S]*?)\[\/DYNAMIC_WORKSPACE\]/i);
    if (dynamicMatch) {
       const jsonString = dynamicMatch[1].trim();
       text = text.replace(dynamicMatch[0], "").trim();
       
       try {
         const dynamicData = JSON.parse(jsonString);
         
         const genId = () => crypto.randomUUID();
         const formattedRoadmap = dynamicData.roadmap.map((week: any) => ({
            id: genId(),
            name: week.name,
            progress: 0,
            type: "parent",
            startOffset: week.startOffset || 0,
            duration: week.duration || 7,
            children: (week.children || []).map((child: any) => ({
               id: genId(),
               name: child.name,
               progress: 0,
               type: "child",
               startOffset: child.startOffset || 0,
               duration: child.duration || 2
            }))
         }));
         
         const wsResult = await createWorkspaceFromTemplate(
           dynamicData.title,
           dynamicData.description,
           formattedRoadmap
         );
         
         if (wsResult.success) {
            redirectUrl = `/workspace/${wsResult.workspaceId}`;
         } else {
            text += "\n\n*(Sistem): Maaf, gagal membuat workspace dinamis karena: " + wsResult.error + "*";
         }
       } catch (e) {
          console.error("Failed to parse dynamic workspace JSON", e);
          text += "\n\n*(Sistem): Maaf, terjadi kesalahan saat memformat roadmap dinamis dari AI.*";
       }
    }

    return NextResponse.json({ reply: text, redirectUrl }, { status: 200 });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan AI." },
      { status: 500 }
    );
  }
}