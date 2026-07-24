"use client";

import { RefreshCw, Sparkles, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { type MaintenanceLog, fetchMaintenanceLogs, predictVehicle } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useVehicleId } from "@/lib/useVehicleId";

const URGENCY_STYLES: Record<MaintenanceLog["urgency"], string> = {
  ROUTINE: "bg-gray-100 text-gray-600",
  SOON: "bg-amber-50 text-amber-700",
  URGENT: "bg-red-50 text-red-700",
};

export default function VehicleMaintenancePage() {
  const vehicleId = useVehicleId();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  function load() {
    if (!vehicleId) return;
    fetchMaintenanceLogs(vehicleId, 50)
      .then(setLogs)
      .catch(() => setError("Could not load maintenance recommendations for this vehicle."));
  }

  useEffect(load, [vehicleId]);

  async function handlePredict() {
    setRunning(true);
    try {
      await predictVehicle(vehicleId);
      load();
    } catch {
      setError("Predict failed - is the backend running?");
    } finally {
      setRunning(false);
    }
  }

  if (error) return <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">Recommendations</h2>
        <button
          onClick={handlePredict}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          <RefreshCw size={14} className={running ? "animate-spin" : ""} />
          Run predictive check
        </button>
      </div>

      {logs.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          <Wrench className="mx-auto mb-2" size={20} />
          No recommendations yet - run a predictive check to generate some.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-gray-800">{log.recommendation}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${URGENCY_STYLES[log.urgency]}`}>
                {log.urgency}
              </span>
            </div>
            {log.ai_explanation && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-brand" />
                {log.ai_explanation}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {log.source === "GEMINI" ? "Gemini" : "Rule engine"} · {formatDateTime(log.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
