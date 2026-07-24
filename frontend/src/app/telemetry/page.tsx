"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, Car, RefreshCw } from "lucide-react";
import { TelemetryCharts } from "@/components/TelemetryCharts";

export default function TelemetryPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await axios.get("http://localhost:8000/api/vehicles");
        const list = res.data || [];
        setVehicles(list);
        if (list.length > 0) {
          setSelectedVehicle(list[0].vehicle_id);
        }
      } catch (err) {
        console.error("Failed to load vehicles", err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  useEffect(() => {
    if (!selectedVehicle) return;
    async function loadTelemetry() {
      try {
        const res = await axios.get(`http://localhost:8000/api/telemetry/${selectedVehicle}?limit=30`);
        setTelemetry(res.data || []);
      } catch (err) {
        console.error("Failed to load telemetry", err);
      }
    }
    loadTelemetry();
  }, [selectedVehicle]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">ECU Telemetry Time-Series Analytics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Raw signal trends for High-Voltage battery pack, ECU bus errors, CPU load, and thermal parameters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-mono">SELECT VEHICLE:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
          >
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.vehicle_id} ({v.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      <TelemetryCharts data={telemetry} />

      {/* Raw Telemetry Data Table */}
      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Raw Telemetry Records</h3>
          <span className="text-xs font-mono text-cyan-400">{telemetry.length} READINGS RECORDED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Battery Temp</th>
                <th className="px-4 py-3">Voltage</th>
                <th className="px-4 py-3">ECU Temp</th>
                <th className="px-4 py-3">CPU %</th>
                <th className="px-4 py-3">CAN Errors</th>
                <th className="px-4 py-3">Encryption</th>
                <th className="px-4 py-3">DTC Codes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {telemetry.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-amber-300">{t.battery_temp_c} °C</td>
                  <td className="px-4 py-3 text-cyan-300">{t.battery_voltage} V</td>
                  <td className="px-4 py-3">{t.ecu_temp_c} °C</td>
                  <td className="px-4 py-3">{t.cpu_usage_pct} %</td>
                  <td className="px-4 py-3 font-bold text-red-400">{t.can_bus_error_count}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      t.encryption_status === "ENABLED" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                    }`}>
                      {t.encryption_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-amber-400">{t.fault_codes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
