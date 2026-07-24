"use client";

import React from "react";

interface ScoreGaugeProps {
  score: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
}

export function ScoreGauge({
  score,
  label,
  sublabel,
  size = 140,
  strokeWidth = 12,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = "#10b981"; // Emerald
  let bgGlow = "rgba(16, 185, 129, 0.15)";

  if (clampedScore < 60) {
    strokeColor = "#ef4444"; // Red
    bgGlow = "rgba(239, 68, 68, 0.2)";
  } else if (clampedScore < 80) {
    strokeColor = "#f59e0b"; // Amber
    bgGlow = "rgba(245, 158, 11, 0.15)";
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full blur-xl transition-all duration-500"
          style={{ background: bgGlow }}
        />
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {clampedScore.toFixed(0)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            / 100
          </span>
        </div>
      </div>
      <h4 className="mt-3 text-sm font-semibold text-slate-200">{label}</h4>
      {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}
