import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { AlertSeverity } from "@/lib/api";
import { SEVERITY_STATUS, STATUS_COLORS, type Status } from "@/lib/format";

const ICONS: Record<Status, typeof AlertTriangle> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  serious: AlertCircle,
  critical: XCircle,
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const status = SEVERITY_STATUS[severity];
  const Icon = ICONS[status];
  const color = STATUS_COLORS[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `${color}1a` }}
    >
      <Icon size={12} />
      {severity}
    </span>
  );
}
