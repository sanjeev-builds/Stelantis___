"use client";

import { useEffect, useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { type Telemetry, fetchTelemetry } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { useVehicleId } from "@/lib/useVehicleId";

const RANGE_OPTIONS = [20, 50, 100] as const;

export default function VehicleTelemetryPage() {
  const vehicleId = useVehicleId();
  const [limit, setLimit] = useState<(typeof RANGE_OPTIONS)[number]>(50);
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    fetchTelemetry(vehicleId, limit)
      .then(setTelemetry)
      .catch(() => setError("Could not load telemetry for this vehicle."));
  }, [vehicleId, limit]);

  const series = (key: keyof Telemetry) =>
    telemetry.map((t) => ({ name: formatTime(t.timestamp), value: Number(t[key]) }));

  if (error) return <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Readings:</span>
        {RANGE_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setLimit(n)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              limit === n ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Last {n}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Battery %" data={series("battery_pct")} />
        <ChartCard title="Battery temperature (C)" data={series("battery_temp_c")} />
        <ChartCard title="Coolant temperature (C)" data={series("coolant_temp_c")} />
        <ChartCard title="Oil pressure (kPa)" data={series("oil_pressure_kpa")} />
        <ChartCard title="CPU usage (%)" data={series("cpu_usage_pct")} />
        <ChartCard title="RAM usage (%)" data={series("ram_usage_pct")} />
        <ChartCard title="Speed (km/h)" data={series("speed_kmh")} />
        <ChartCard title="CAN bus error count" data={series("can_bus_error_count")} />
      </div>
    </div>
  );
}
