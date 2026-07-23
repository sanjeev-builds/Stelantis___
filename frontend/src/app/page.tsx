"use client";

import { useEffect, useState } from "react";
import { Gauge, Battery, Thermometer, Fuel } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { DashboardCard } from "@/components/DashboardCard";
import { ChartCard } from "@/components/ChartCard";
import { fetchTelemetry, type VehicleTelemetry } from "@/lib/api";

export default function Home() {
  const [telemetry, setTelemetry] = useState<VehicleTelemetry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTelemetry()
      .then(setTelemetry)
      .catch(() => setError("Could not reach backend - is it running? See backend/README.md"));
  }, []);

  const latest = telemetry.at(-1);
  const speedSeries = telemetry.slice(-20).map((t, i) => ({ name: String(i), value: t.speed }));

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          {error && (
            <p className="mb-4 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              {error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <DashboardCard label="Speed" value={latest ? `${latest.speed} km/h` : "--"} icon={Gauge} />
            <DashboardCard label="Battery" value={latest ? `${latest.battery_voltage} V` : "--"} icon={Battery} />
            <DashboardCard label="Engine Temp" value={latest ? `${latest.engine_temp} °C` : "--"} icon={Thermometer} />
            <DashboardCard label="Fuel" value={latest ? `${latest.fuel_level}%` : "--"} icon={Fuel} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChartCard title="Speed (last 20 readings)" data={speedSeries} />
          </div>
        </main>
      </div>
    </div>
  );
}
