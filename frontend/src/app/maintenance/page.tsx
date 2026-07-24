"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Wrench, Sparkles, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [logs, setLogs] = useState<any[]>([]);
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
        console.error("Error loading vehicles", err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  useEffect(() => {
    if (!selectedVehicle) return;
    async function loadLogs() {
      try {
        const res = await axios.get(`http://localhost:8000/api/maintenance/${selectedVehicle}`);
        setLogs(res.data || []);
      } catch (err) {
        console.error("Error loading maintenance logs", err);
      }
    }
    loadLogs();
  }, [selectedVehicle]);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toUpperCase()) {
      case "URGENT":
        return <span className="badge-critical font-mono">URGENT INTERVENTION</span>;
      case "SOON":
        return <span className="badge-high font-mono">SCHEDULE SOON</span>;
      default:
        return <span className="badge-low font-mono">ROUTINE CHECK</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Actionable Maintenance & Triage Log</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive AI & Rule Engine generated repair recommendations with root-cause diagnostic rationales.
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

      {logs.length === 0 ? (
        <div className="glass-card p-10 rounded-xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">Vehicle Maintenance Nominal</h3>
          <p className="text-xs text-slate-400">No urgent service interventions or maintenance actions required for vehicle {selectedVehicle}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {logs.map((log) => (
            <div key={log.id} className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-cyan-400 text-xs font-bold">{log.vehicle_id}</span>
                  {getUrgencyBadge(log.urgency)}
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  SOURCE: {log.source}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100">{log.recommendation}</h4>
                {log.ai_explanation && (
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{log.ai_explanation}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/60 pt-2.5">
                <span>Created: {new Date(log.created_at).toLocaleString()}</span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Logged to Stellantis Service Network</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
