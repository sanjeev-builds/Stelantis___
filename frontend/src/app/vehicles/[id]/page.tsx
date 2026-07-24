"use client";

import { Battery, Gauge, Shield, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { DashboardCard } from "@/components/DashboardCard";
import { ScoreGauge } from "@/components/ScoreGauge";
import { type HealthScore, type Telemetry, fetchHealthScores, fetchTelemetry } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { useVehicleId } from "@/lib/useVehicleId";

export default function VehicleOverviewPage() {
  const vehicleId = useVehicleId();
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [scores, setScores] = useState<HealthScore[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    Promise.all([fetchTelemetry(vehicleId, 30), fetchHealthScores(vehicleId, 30)])
      .then(([t, s]) => {
        setTelemetry(t);
        setScores(s);
      })
      .catch(() => setError("Could not load this vehicle's data."));
  }, [vehicleId]);

  const latest = telemetry.at(-1);
  const latestScore = scores.at(-1);
  const healthSeries = scores.map((s) => ({ name: formatTime(s.computed_at), value: s.vehicle_health_score }));
  const batteryTempSeries = telemetry.map((t) => ({ name: formatTime(t.timestamp), value: t.battery_temp_c }));

  if (error) return <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreGauge label="Overall Health" score={latestScore?.vehicle_health_score ?? 0} />
        <ScoreGauge label="Battery Health" score={latestScore?.battery_health_score ?? 0} />
        <ScoreGauge label="Cybersecurity" score={latestScore?.cybersecurity_score ?? 0} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <DashboardCard label="Battery" value={latest ? `${latest.battery_pct.toFixed(0)}%` : "--"} icon={Battery} />
        <DashboardCard
          label="Battery Temp"
          value={latest ? `${latest.battery_temp_c.toFixed(1)} C` : "--"}
          icon={Thermometer}
        />
        <DashboardCard label="Speed" value={latest ? `${latest.speed_kmh.toFixed(0)} km/h` : "--"} icon={Gauge} />
        <DashboardCard label="Encryption" value={latest?.encryption_status ?? "--"} icon={Shield} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Overall health score (recent)" data={healthSeries} />
        <ChartCard title="Battery temperature C (recent)" data={batteryTempSeries} />
      </div>
    </div>
  );
}
