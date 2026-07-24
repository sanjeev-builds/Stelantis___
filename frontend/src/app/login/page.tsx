"use client";

import { Cpu } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass-card border border-slate-800 rounded-2xl p-8 flex flex-col items-center">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white mb-1">Stellantis SDV Cloud</h1>
        <p className="text-xs text-slate-400 mb-6 text-center">
          Vehicle Health &amp; Predictive Maintenance Platform
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
