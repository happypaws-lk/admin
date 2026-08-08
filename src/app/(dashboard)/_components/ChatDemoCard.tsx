"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ChatDemoCard() {
  const [messages, setMessages] = useState([
    { id: "1", sender: "bot", text: "Hi, how can I help you today?" },
    { id: "2", sender: "user", text: "Hey, I'm having trouble with my account." },
    { id: "3", sender: "bot", text: "What seems to be the problem?" },
    { id: "4", sender: "user", text: "I can't log in." },
  ]);

  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), sender: "user", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-zinc-700">
            <AvatarFallback className="text-xs font-bold bg-zinc-800 text-zinc-100">
              SD
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-xs font-bold text-white">Sofia Davis</h4>
            <p className="text-[11px] text-zinc-400">m@example.com</p>
          </div>
        </div>

        <button
          type="button"
          className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-white text-zinc-950 font-medium rounded-br-none shadow-sm"
                  : "bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="h-9 bg-zinc-900/90 border-zinc-800 text-xs placeholder:text-zinc-500 focus-visible:ring-zinc-700"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center shrink-0 border border-zinc-700/60 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
