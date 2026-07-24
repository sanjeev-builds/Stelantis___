"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", suffix: "" },
  { label: "Telemetry", suffix: "/telemetry" },
  { label: "Health", suffix: "/health" },
  { label: "Maintenance", suffix: "/maintenance" },
  { label: "Alerts", suffix: "/alerts" },
];

export function VehicleNav({ vehicleId }: { vehicleId: string }) {
  const pathname = usePathname();
  const base = `/vehicles/${vehicleId}`;

  return (
    <nav className="mb-6 flex gap-1 border-b border-gray-200">
      {TABS.map((tab) => {
        const href = `${base}${tab.suffix}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.label}
            href={href}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
