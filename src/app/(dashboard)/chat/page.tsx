"use client";

import React, { useState, useRef, useEffect } from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Tipe data untuk membedakan pesan pengguna dan AI
type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export default function ChatAIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "ai",
      content:
        "Halo! Saya asisten AI MindHub. Ada yang bisa saya bantu hari ini terkait materi belajar atau pembuatan roadmap kamu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ref untuk fitur auto-scroll ke bawah saat ada pesan baru
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    // Tambahkan pesan user ke UI seketika
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Panggil Backend Route API yang kita buat tadi
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          // Kirim riwayat percakapan agar AI paham konteks (kecuali pesan sambutan)
          history: messages.filter((m) => m.id !== "welcome-msg"),
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (data.redirectUrl) {
        toast.success("Workspace created automatically by AI!");
        router.refresh();
        router.push(data.redirectUrl);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback pesan error ke UI
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: "Sorry, connection to the AI server was lost. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Apakah kamu yakin ingin menghapus seluruh percakapan?")) {
      setMessages([messages[0]]); // Sisakan pesan sambutan awal
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 font-sans antialiased flex flex-col overflow-hidden">
      <FloatingHeader />

      <main className="flex-1 flex flex-col mt-24 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6 animate-in fade-in duration-300 relative h-[calc(100vh-6rem)]">
        {/* Header Chat */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
                Megi AI
              </h1>
              <p className="text-xs text-neutral-500 font-medium">
                Powered by Gemini 1.5 Flash
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-md transition-colors"
            title="Hapus Percakapan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Area Percakapan (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border ${
                  msg.role === "ai"
                    ? "bg-neutral-900 border-neutral-800 text-emerald-500"
                    : "bg-neutral-100 border-neutral-200 text-neutral-950"
                }`}
              >
                {msg.role === "ai" ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Balon Chat */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-[14px] leading-relaxed shadow-sm ${
                  msg.role === "ai"
                    ? "bg-neutral-900/50 border border-neutral-800/80 text-neutral-200"
                    : "bg-neutral-100 text-neutral-950 font-medium"
                }`}
              >
                {/* whitespace-pre-wrap agar baris baru dirender dengan benar */}
                <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            </div>
          ))}

          {/* Indikator Loading */}
          {isLoading && (
            <div className="flex gap-4 flex-row animate-pulse">
              <div className="w-8 h-8 shrink-0 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[75%] rounded-2xl px-5 py-3.5 bg-neutral-900/50 border border-neutral-800/80 text-neutral-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Megi sedang berpikir...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Area Input Fix di Bawah */}
        <div className="pt-4 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-center bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-neutral-700 transition-all shadow-lg"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu pada Megi..."
              className="flex-1 bg-transparent px-5 py-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 mr-2 bg-neutral-100 text-neutral-950 hover:bg-neutral-300 disabled:opacity-50 disabled:hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-[10px] text-neutral-600 mt-3 font-medium">
            AI dapat membuat kesalahan. Harap periksa kembali informasi penting.
          </p>
        </div>
      </main>
    </div>
  );
}
