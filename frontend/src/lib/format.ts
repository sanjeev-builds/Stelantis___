export type Status = "good" | "warning" | "serious" | "critical";

// Status palette - fixed, never themed. See the dataviz skill's palette.md.
export const STATUS_COLORS: Record<Status, string> = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const STATUS_LABELS: Record<Status, string> = {
  good: "Good",
  warning: "Watch",
  serious: "Serious",
  critical: "Critical",
};

export function scoreStatus(score: number): Status {
  if (score >= 80) return "good";
  if (score >= 60) return "warning";
  if (score >= 40) return "serious";
  return "critical";
}

export const SEVERITY_STATUS: Record<string, Status> = {
  LOW: "good",
  MEDIUM: "warning",
  HIGH: "serious",
  CRITICAL: "critical",
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
