// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi SDK dengan API Key dari environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // Menggunakan model Gemini 1.5 Flash yang sangat cepat dan gratis
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    const text = response.text();

    return NextResponse.json({ reply: text }, { status: 200 });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan AI." },
      { status: 500 }
    );
  }
}