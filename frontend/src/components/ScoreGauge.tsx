import { STATUS_COLORS, STATUS_LABELS, scoreStatus } from "@/lib/format";

export function ScoreGauge({ label, score }: { label: string; score: number }) {
  const status = scoreStatus(score);
  const color = STATUS_COLORS[status];
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e1e0d9" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold [font-variant-numeric:tabular-nums]">{Math.round(score)}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs font-medium" style={{ color }}>
          {STATUS_LABELS[status]}
        </div>
      </div>
    </div>
  );
}
