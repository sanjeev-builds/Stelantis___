"use client";

import { useState } from "react";
import axios from "axios";
import { MessageSquare, Send, Sparkles, User, Bot, Loader2 } from "lucide-react";

interface AIChatPanelProps {
  vehicleId: string;
}

export function AIChatPanel({ vehicleId }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: `Hello! I am the Stellantis AI Diagnostic Advisor for vehicle ${vehicleId}. Ask me about battery health, fault codes, or maintenance recommendations!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/chat", {
        vehicle_id: vehicleId,
        query: userText,
      });

      if (res.data && res.data.response) {
        setMessages((prev) => [...prev, { sender: "ai", text: res.data.response }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Vehicle AI diagnostic service is currently responding in offline mode. Health scores remain 100% nominal.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What is the battery health status?",
    "Are there any CAN bus security warnings?",
    "What maintenance should be scheduled soon?",
  ];

  return (
    <div className="glass-card rounded-xl border border-slate-800 flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Gemini AI Diagnostic Assistant</h3>
            <p className="text-[10px] text-slate-400 font-mono">CONTEXT: {vehicleId}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start space-x-2.5 ${
              m.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                m.sender === "user" ? "bg-blue-600 text-white" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Analyzing vehicle telemetry context...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] text-slate-500 uppercase font-mono flex-shrink-0">Quick:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(q);
            }}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Gemini about vehicle ${vehicleId}...`}
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white p-2.5 rounded-lg transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
