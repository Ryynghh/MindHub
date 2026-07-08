"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Trash2, X, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export function ChatBotPopup() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
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

      // Jika AI berhasil membuat workspace, redirect user
      if (data.redirectUrl) {
        toast.success("Workspace created automatically by AI!");
        setIsOpen(false);
        router.refresh();
        router.push(data.redirectUrl);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
      setMessages([messages[0]]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-900/20 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] max-h-[80vh] max-w-[calc(100vw-3rem)] bg-[#09090b] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex justify-between items-center p-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">
                  Megi AI
                </h2>
                <p className="text-[10px] text-neutral-500 font-medium">
                  Powered by Gemini 1.5 Flash
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-md transition-colors"
              title="Hapus Percakapan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center border ${
                    msg.role === "ai"
                      ? "bg-neutral-900 border-neutral-800 text-emerald-500"
                      : "bg-neutral-100 border-neutral-200 text-neutral-950"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <Bot className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                    msg.role === "ai"
                      ? "bg-neutral-900/50 border border-neutral-800/80 text-neutral-200"
                      : "bg-neutral-100 text-neutral-950 font-medium"
                  }`}
                >
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 flex-row animate-pulse">
                <div className="w-7 h-7 shrink-0 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-neutral-900/50 border border-neutral-800/80 text-neutral-400 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Megi sedang berpikir...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-neutral-900 bg-neutral-950 shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-neutral-700 transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya Megi..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 mr-1 bg-neutral-100 text-neutral-950 hover:bg-neutral-300 disabled:opacity-50 disabled:hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
