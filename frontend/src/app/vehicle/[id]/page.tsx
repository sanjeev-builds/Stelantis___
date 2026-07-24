"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import {
  Car,
  Battery,
  Shield,
  Activity,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Thermometer,
  Cpu,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ScoreGauge } from "@/components/ScoreGauge";
import { MetricCard } from "@/components/MetricCard";
import { AlertsTable } from "@/components/AlertsTable";
import { AIChatPanel } from "@/components/AIChatPanel";
import { ExternalContextPanel } from "@/components/ExternalContextPanel";

// Recharts assigns internal element ids (clipPath/gradient) from a
// module-level counter that increments differently on the server vs. the
// client, so SSR-ing this component causes a hydration mismatch and the
// whole chart subtree gets silently dropped. Client-only render avoids it.
const TelemetryCharts = dynamic(
  () => import("@/components/TelemetryCharts").then((mod) => mod.TelemetryCharts),
  { ssr: false, loading: () => <div className="h-60 w-full" /> }
);

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;

  const [vehicle, setVehicle] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [healthScores, setHealthScores] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVehicleData = async () => {
    try {
      const [vRes, tRes, hRes, aRes, sRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/vehicles/${vehicleId}`),
        axios.get(`http://localhost:8000/api/telemetry/${vehicleId}`),
        axios.get(`http://localhost:8000/api/health/${vehicleId}`),
        axios.get(`http://localhost:8000/api/alerts/${vehicleId}`),
        axios.get(`http://localhost:8000/api/summary/${vehicleId}`),
      ]);
      setVehicle(vRes.data);
      setTelemetry(tRes.data || []);
      setHealthScores(hRes.data || []);
      setAlerts(aRes.data || []);
      setAiSummary(sRes.data?.summary || "");
    } catch (err) {
      console.error("Error fetching vehicle details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetching from the backend when vehicleId changes - synchronizing with
    // an external system, the valid effect case. fetchVehicleData is
    // intentionally omitted from deps: it's redefined every render, so
    // including it would refetch on every render instead of only on
    // navigation to a different vehicle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVehicleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      await axios.post(`http://localhost:8000/api/analyze`, { vehicle_id: vehicleId });
      await axios.post(`http://localhost:8000/api/predict`, { vehicle_id: vehicleId });
      await fetchVehicleData();
    } catch (err) {
      console.error("Analysis execution error", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-cyan-400 font-mono text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Fetching vehicle ECU telemetry...</span>
        </div>
      </div>
    );
  }

  const latestT = telemetry[0] || {};
  const latestH = healthScores[0] || {
    vehicle_health_score: 85.0,
    battery_health_score: 88.0,
    cybersecurity_score: 90.0,
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <Link href="/" className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Overview</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-white font-mono">{vehicle.vehicle_id}</h1>
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800/80 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">
              {vehicle.model}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Type: {vehicle.vehicle_type} | Firmware: {vehicle.firmware_version} | Mileage: {vehicle.mileage_km.toLocaleString()} km
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} />
            <span>{analyzing ? "Analyzing Telemetry..." : "Run Diagnostic Scoring Engine"}</span>
          </button>
        </div>
      </div>

      {/* AI Summary Card */}
      {aiSummary && (
        <div className="glass-card p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono">
              Groq AI Diagnostic Summary
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">{aiSummary}</p>
          </div>
        </div>
      )}

      {/* 3 Score Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col items-center">
          <ScoreGauge score={latestH.vehicle_health_score} label="Vehicle Composite Health" sublabel="Overall Score" />
        </div>
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col items-center">
          <ScoreGauge score={latestH.battery_health_score} label="HV Battery Pack Health" sublabel="SoH & Thermal Proxy" />
        </div>
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col items-center">
          <ScoreGauge score={latestH.cybersecurity_score} label="Cybersecurity Audit" sublabel="UNECE R155 Security" />
        </div>
      </div>

      {/* Telemetry Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Battery Pack Temp"
          value={latestT.battery_temp_c ?? 25}
          unit="°C"
          icon={Thermometer}
          status={latestT.battery_temp_c > 45 ? "critical" : latestT.battery_temp_c > 38 ? "warning" : "normal"}
          subtitle="Optimal: 20°C - 35°C"
        />
        <MetricCard
          title="Pack Voltage"
          value={latestT.battery_voltage ?? 380}
          unit="V"
          icon={Zap}
          subtitle="Nominal: 380 V"
        />
        <MetricCard
          title="CAN Bus Error Count"
          value={latestT.can_bus_error_count ?? 0}
          unit="errors"
          icon={Activity}
          status={latestT.can_bus_error_count > 10 ? "critical" : latestT.can_bus_error_count > 3 ? "warning" : "normal"}
          subtitle="Bus error counter"
        />
        <MetricCard
          title="Bus Encryption"
          value={latestT.encryption_status ?? "ENABLED"}
          icon={Shield}
          status={latestT.encryption_status === "DISABLED" ? "critical" : "normal"}
          subtitle="ECU Gateway TLS"
        />
      </div>

      {/* Recharts Time Series */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Real-Time ECU Telemetry Trends</h3>
        <TelemetryCharts data={telemetry} />
      </div>

      {/* Predictive Alerts & AI Advisor Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsTable alerts={alerts} />
        <AIChatPanel vehicleId={vehicleId} />
      </div>

      {/* Real-World Context: Recalls, Weather, Charging */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Real-World Context</h3>
        <ExternalContextPanel vehicleId={vehicleId} />
      </div>
    </div>
  );
}
