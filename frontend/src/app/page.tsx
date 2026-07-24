"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Car, ShieldAlert, Zap, Cpu, ArrowUpRight, Activity, ChevronRight } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { MetricCard } from "@/components/MetricCard";

interface Vehicle {
  vehicle_id: string;
  model: string;
  vehicle_type: string;
  manufacture_year: number;
  firmware_version: string;
  mileage_km: number;
}

interface Alert {
  id: number;
  vehicle_id: string;
  severity: string;
  category: string;
  message: string;
  predicted_days_to_service: number;
}

export default function FleetDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vRes, aRes] = await Promise.all([
          axios.get("http://localhost:8000/api/vehicles"),
          axios.get("http://localhost:8000/api/alerts"),
        ]);
        setVehicles(vRes.data || []);
        setAlerts(aRes.data || []);
      } catch (err) {
        console.error("Failed to load fleet data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const highCount = alerts.filter((a) => a.severity === "HIGH").length;

  return (
    <div className="space-y-6">
      {/* Fleet Hero Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded">
                LIVE TELEMETRY FEED
              </span>
              <span className="text-xs text-slate-400">• UNECE R155 Security Compliant</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-2">
              Fleet Health & Predictive Maintenance Overview
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time monitoring of ECU telemetry, battery degradation trends, and deterministic health scoring across connected Stellantis vehicles.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/alerts"
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{alerts.length} Active Alerts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Fleet Size"
          value={vehicles.length}
          unit="vehicles"
          icon={Car}
          subtitle="Active Stellantis EVs & PHEVs"
        />
        <MetricCard
          title="Critical Alerts"
          value={criticalCount}
          unit="vehicles"
          icon={ShieldAlert}
          status={criticalCount > 0 ? "critical" : "normal"}
          subtitle="Immediate service intervention"
        />
        <MetricCard
          title="High Risk Predictions"
          value={highCount}
          unit="vehicles"
          icon={Zap}
          status={highCount > 0 ? "warning" : "normal"}
          subtitle="Service required < 10 days"
        />
        <MetricCard
          title="Avg Fleet Health"
          value="87.4"
          unit="/ 100"
          icon={Activity}
          subtitle="Deterministic Composite Score"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles Table (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Connected Vehicles Directory</h3>
            <span className="text-xs text-slate-400 font-mono">Showing {vehicles.length} active units</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Vehicle ID</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Powertrain</th>
                  <th className="px-4 py-3">Mileage</th>
                  <th className="px-4 py-3">Firmware</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {vehicles.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-900/50 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-cyan-400">{v.vehicle_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-100">{v.model}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        v.vehicle_type === "EV" ? "bg-cyan-950 text-cyan-400 border-cyan-800" : "bg-indigo-950 text-indigo-400 border-indigo-800"
                      }`}>
                        {v.vehicle_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{v.mileage_km.toLocaleString()} km</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{v.firmware_version}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/vehicle/${v.vehicle_id}`}
                        className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Score Gauges Summary (1 col) */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            Fleet Aggregate Health
          </h3>
          <div className="flex flex-col items-center justify-center space-y-2">
            <ScoreGauge score={87} label="Vehicle Composite" sublabel="Fleet Mean Score" size={160} />
            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              <div className="glass-card p-3 rounded-lg text-center">
                <span className="text-xs text-slate-400 font-mono">BATTERY SOH</span>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">91.2%</p>
              </div>
              <div className="glass-card p-3 rounded-lg text-center">
                <span className="text-xs text-slate-400 font-mono">CYBER AUDIT</span>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">94.8%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
