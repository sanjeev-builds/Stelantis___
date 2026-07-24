"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Lock, Mail, LogIn } from "lucide-react";
import { api } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@hackathon.dev");
  const [password, setPassword] = useState("hackathon");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", data.access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
      router.replace("/");
    } catch {
      setError("Login failed - check the backend is running and credentials are correct.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@stellantis.com"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-cyan-500/20 transition"
      >
        <LogIn className="w-4 h-4" />
        <span>{loading ? "Signing in..." : "Sign in"}</span>
      </button>

      <p className="text-[11px] text-slate-500 text-center font-mono">
        Demo credentials are prefilled - just press Sign in.
      </p>
    </form>
  );
}
