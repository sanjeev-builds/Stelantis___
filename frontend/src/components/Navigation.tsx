"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { Activity, AlertTriangle, Car, Cpu, ShieldAlert, Wrench, MessageSquare, Sliders, LogOut } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  function handleSignOut() {
    localStorage.removeItem("access_token");
    delete axios.defaults.headers.common["Authorization"];
    router.replace("/login");
  }

  const navItems = [
    { label: "Fleet Overview", href: "/", icon: Car },
    { label: "Custom Test Lab", href: "/simulator", icon: Sliders },
    { label: "Predictive Alerts", href: "/alerts", icon: ShieldAlert },
    { label: "Telemetry History", href: "/telemetry", icon: Activity },
    { label: "Maintenance", href: "/maintenance", icon: Wrench },
    { label: "AI Advisor", href: "/ai-assistant", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-lg">
                STELLANTIS
              </span>
              <span className="text-xs bg-slate-800 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                SDV CLOUD
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight">Vehicle Health & Predictive Maintenance Platform</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API ONLINE</span>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="flex items-center space-x-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 text-xs px-2.5 py-1.5 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
