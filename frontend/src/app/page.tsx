"use client";

import { AlertTriangle, Battery, Car, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/DashboardCard";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { type Alert, type HealthScore, type Vehicle, fetchAlerts, fetchHealthScores, fetchVehicles } from "@/lib/api";
import { STATUS_COLORS, scoreStatus } from "@/lib/format";
import { REFRESH_INTERVAL_KEY } from "@/lib/settings";
import { useStoredValue } from "@/lib/useStoredValue";

type Row = {
  vehicle: Vehicle;
  score: HealthScore | null;
  activeAlerts: Alert[];
};

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshMs] = useStoredValue(REFRESH_INTERVAL_KEY, 0);

  useEffect(() => {
    async function load() {
      try {
        const vehicles = await fetchVehicles();
        const loaded = await Promise.all(
          vehicles.map(async (vehicle) => {
            const [scores, alerts] = await Promise.all([
              fetchHealthScores(vehicle.vehicle_id, 1),
              fetchAlerts(vehicle.vehicle_id),
            ]);
            return {
              vehicle,
              score: scores.at(-1) ?? null,
              activeAlerts: alerts.filter((a) => !a.resolved),
            };
          }),
        );
        setRows(loaded);
      } catch {
        setError("Could not reach backend - is it running? See backend/README.md");
      } finally {
        setLoading(false);
      }
    }
    load();
    if (!refreshMs) return;
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  const fleetAverage = (key: "vehicle_health_score" | "battery_health_score" | "cybersecurity_score") => {
    const values = rows.map((r) => r.score?.[key]).filter((v): v is number => typeof v === "number");
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const avgHealth = fleetAverage("vehicle_health_score");
  const avgBattery = fleetAverage("battery_health_score");
  const avgCyber = fleetAverage("cybersecurity_score");
  const totalAlerts = rows.reduce((sum, r) => sum + r.activeAlerts.length, 0);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          {error && <p className="mb-4 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <DashboardCard label="Fleet Health" value={avgHealth !== null ? `${avgHealth.toFixed(0)}/100` : "--"} icon={Car} />
            <DashboardCard
              label="Battery Health"
              value={avgBattery !== null ? `${avgBattery.toFixed(0)}/100` : "--"}
              icon={Battery}
            />
            <DashboardCard label="Cybersecurity" value={avgCyber !== null ? `${avgCyber.toFixed(0)}/100` : "--"} icon={ShieldCheck} />
            <DashboardCard label="Active Alerts" value={totalAlerts} icon={AlertTriangle} />
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">Fleet</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-2 font-medium">Vehicle</th>
                  <th className="px-4 py-2 font-medium">Model</th>
                  <th className="px-4 py-2 font-medium">Health</th>
                  <th className="px-4 py-2 font-medium">Battery</th>
                  <th className="px-4 py-2 font-medium">Cyber</th>
                  <th className="px-4 py-2 font-medium">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                      Loading fleet...
                    </td>
                  </tr>
                )}
                {!loading && rows.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                      No vehicles yet.
                    </td>
                  </tr>
                )}
                {rows.map(({ vehicle, score, activeAlerts }) => (
                  <tr key={vehicle.vehicle_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/vehicles/${vehicle.vehicle_id}`} className="font-medium text-brand hover:underline">
                        {vehicle.vehicle_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{vehicle.model}</td>
                    <td className="px-4 py-3">
                      <ScoreCell score={score?.vehicle_health_score} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreCell score={score?.battery_health_score} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreCell score={score?.cybersecurity_score} />
                    </td>
                    <td className="px-4 py-3">
                      {activeAlerts.length === 0 ? (
                        <span className="text-gray-400">None</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                          {activeAlerts.length}
                          <AlertTriangle size={14} className="text-amber-500" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

function ScoreCell({ score }: { score?: number }) {
  if (score === undefined) return <span className="text-gray-400">--</span>;
  const status = scoreStatus(score);
  return (
    <span className="inline-flex items-center gap-1.5 font-medium [font-variant-numeric:tabular-nums]">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
      {Math.round(score)}
    </span>
  );
}
