"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: "normal" | "warning" | "critical";
  subtitle?: string;
}

export function MetricCard({ title, value, unit, icon: Icon, status = "normal", subtitle }: MetricCardProps) {
  let borderColor = "border-slate-800";
  let iconBg = "bg-slate-800 text-slate-300";
  let statusBadge = null;

  if (status === "warning") {
    borderColor = "border-amber-500/40";
    iconBg = "bg-amber-500/10 text-amber-400";
    statusBadge = <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">WARN</span>;
  } else if (status === "critical") {
    borderColor = "border-red-500/40";
    iconBg = "bg-red-500/10 text-red-400";
    statusBadge = <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono animate-pulse">ALERT</span>;
  }

  return (
    <div className={`glass-card p-4 rounded-xl border ${borderColor} flex items-center justify-between`}>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          {statusBadge}
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
          {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
        </div>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>

      <div className={`p-3 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
