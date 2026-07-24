"use client";

import { Battery, Gauge, RadioTower, Shield, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { DashboardCard } from "@/components/DashboardCard";
import { ScoreGauge } from "@/components/ScoreGauge";
import {
  type HealthScore,
  type Telemetry,
  analyzeVehicle,
  fetchHealthScores,
  fetchTelemetry,
  ingestTelemetry,
} from "@/lib/api";
import { formatTime } from "@/lib/format";
import { useVehicleId } from "@/lib/useVehicleId";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const jitter = (value: number, spread: number, min: number, max: number) =>
  clamp(value + (Math.random() - 0.5) * spread, min, max);

export default function VehicleOverviewPage() {
  const vehicleId = useVehicleId();
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [scores, setScores] = useState<HealthScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  function load() {
    if (!vehicleId) return;
    Promise.all([fetchTelemetry(vehicleId, 30), fetchHealthScores(vehicleId, 30)])
      .then(([t, s]) => {
        setTelemetry(t);
        setScores(s);
      })
      .catch(() => setError("Could not load this vehicle's data."));
  }

  useEffect(load, [vehicleId]);

  async function handleSimulateReading() {
    const base = telemetry.at(-1);
    if (!base) return;
    setSimulating(true);
    try {
      // Demonstrates the ingestion endpoint the audit found missing: a real
      // ECU/simulator would POST here continuously; this is one reading,
      // validated by TelemetryIn's physically-plausible field ranges.
      await ingestTelemetry({
        vehicle_id: vehicleId,
        battery_pct: jitter(base.battery_pct, 4, 0, 100),
        battery_voltage: jitter(base.battery_voltage, 0.2, 0, 20),
        battery_temp_c: jitter(base.battery_temp_c, 1.5, -40, 100),
        ecu_temp_c: jitter(base.ecu_temp_c, 2, -40, 150),
        cpu_usage_pct: jitter(base.cpu_usage_pct, 8, 0, 100),
        ram_usage_pct: jitter(base.ram_usage_pct, 8, 0, 100),
        speed_kmh: jitter(base.speed_kmh, 15, 0, 200),
        motor_rpm: Math.round(jitter(base.motor_rpm, 500, 0, 8000)),
        engine_load_pct: jitter(base.engine_load_pct, 8, 0, 100),
        coolant_temp_c: jitter(base.coolant_temp_c, 1.5, -40, 150),
        oil_pressure_kpa: jitter(base.oil_pressure_kpa, 5, 0, 1000),
        fault_codes: base.fault_codes,
        encryption_status: base.encryption_status,
        can_bus_error_count: base.can_bus_error_count,
        unauthorized_access_attempts: base.unauthorized_access_attempts,
        gps_lat: base.gps_lat,
        gps_lng: base.gps_lng,
      });
      await analyzeVehicle(vehicleId);
      load();
    } catch {
      setError("Could not simulate a new reading - is the backend running?");
    } finally {
      setSimulating(false);
    }
  }

  const latest = telemetry.at(-1);
  const latestScore = scores.at(-1);
  const healthSeries = scores.map((s) => ({ name: formatTime(s.computed_at), value: s.vehicle_health_score }));
  const batteryTempSeries = telemetry.map((t) => ({ name: formatTime(t.timestamp), value: t.battery_temp_c }));

  if (error) return <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">Live status</h2>
        <button
          onClick={handleSimulateReading}
          disabled={simulating || !latest}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          <RadioTower size={14} className={simulating ? "animate-pulse" : ""} />
          Simulate incoming reading
        </button>
      </div>

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
