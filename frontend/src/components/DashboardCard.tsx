import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
};

export function DashboardCard({ label, value, icon: Icon, trend }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon size={18} className="text-brand" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {trend && <div className="mt-1 text-xs text-gray-400">{trend}</div>}
    </div>
  );
}
