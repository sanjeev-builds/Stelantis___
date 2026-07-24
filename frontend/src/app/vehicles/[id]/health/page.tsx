"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { ScoreGauge } from "@/components/ScoreGauge";
import { type HealthScore, analyzeVehicle, fetchHealthScores } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useVehicleId } from "@/lib/useVehicleId";

export default function VehicleHealthPage() {
  const vehicleId = useVehicleId();
  const [scores, setScores] = useState<HealthScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function load() {
    if (!vehicleId) return;
    fetchHealthScores(vehicleId, 50)
      .then(setScores)
      .catch(() => setError("Could not load health score history for this vehicle."));
  }

  useEffect(load, [vehicleId]);

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      await analyzeVehicle(vehicleId);
      load();
    } catch {
      setError("Analyze failed - is the backend running?");
    } finally {
      setAnalyzing(false);
    }
  }

  const latest = scores.at(-1);
  const series = (key: keyof HealthScore) =>
    scores.map((s) => ({ name: formatDateTime(s.computed_at), value: Number(s[key]) }));

  if (error) return <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">Latest breakdown</h2>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          <RefreshCw size={14} className={analyzing ? "animate-spin" : ""} />
          Analyze latest telemetry
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreGauge label="Overall Health" score={latest?.vehicle_health_score ?? 0} />
        <ScoreGauge label="Battery Health" score={latest?.battery_health_score ?? 0} />
        <ScoreGauge label="Cybersecurity" score={latest?.cybersecurity_score ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartCard title="Overall health trend" data={series("vehicle_health_score")} />
        <ChartCard title="Battery health trend" data={series("battery_health_score")} />
        <ChartCard title="Cybersecurity trend" data={series("cybersecurity_score")} />
      </div>
    </div>
  );
}
