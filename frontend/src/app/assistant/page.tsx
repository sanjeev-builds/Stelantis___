"use client";

import { Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { type Vehicle, chatAboutVehicle, fetchVehicles } from "@/lib/api";
import { DEFAULT_VEHICLE_KEY } from "@/lib/settings";
import { useStoredValue } from "@/lib/useStoredValue";

type Message = { role: "user" | "assistant"; text: string };

const QUICK_QUESTIONS = [
  "Is this vehicle safe to drive right now?",
  "What maintenance should I schedule soon?",
  "Summarize this vehicle's cybersecurity status.",
  "Why is the health score what it is?",
];

export default function AssistantPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useStoredValue(DEFAULT_VEHICLE_KEY, "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchVehicles()
      .then((list) => {
        setVehicles(list);
        if (!vehicleId && list.length > 0) setVehicleId(list[0].vehicle_id);
      })
      .catch(() => setVehicles([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(question: string) {
    if (!question.trim() || !vehicleId) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setSending(true);
    try {
      const answer = await chatAboutVehicle(vehicleId, question);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong reaching the AI assistant." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="flex h-[calc(100vh-4rem)] flex-col p-6">
          <div className="mb-4 flex items-center gap-3">
            <h1 className="text-xl font-semibold">AI Assistant</h1>
            <select
              value={vehicleId}
              onChange={(e) => {
                setVehicleId(e.target.value);
                setMessages([]);
              }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.vehicle_id} - {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-400">
                  <Sparkles size={24} className="text-brand" />
                  Ask about this vehicle&apos;s health, battery, cybersecurity, or maintenance.
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        m.role === "user" ? "bg-brand text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {sending && <div className="text-xs text-gray-400">Thinking...</div>}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-gray-200 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about this vehicle..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
