"use client";

import { ShieldAlert, AlertTriangle, Info, Clock, CheckCircle2 } from "lucide-react";

interface AlertItem {
  id: number;
  vehicle_id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  category: string;
  message: string;
  predicted_days_to_service: number;
  created_at: string;
  resolved: boolean;
}

interface AlertsTableProps {
  alerts: AlertItem[];
}

export function AlertsTable({ alerts }: AlertsTableProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h4 className="text-base font-semibold text-slate-200">No Active Predictive Alerts</h4>
        <p className="text-xs text-slate-400">All connected vehicle telemetry systems are operating within safe bounds.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return <span className="badge-critical flex items-center space-x-1"><AlertTriangle className="w-3 h-3 mr-1" />CRITICAL</span>;
      case "HIGH":
        return <span className="badge-high flex items-center space-x-1"><AlertTriangle className="w-3 h-3 mr-1" />HIGH</span>;
      case "MEDIUM":
        return <span className="badge-medium flex items-center space-x-1"><Info className="w-3 h-3 mr-1" />MEDIUM</span>;
      default:
        return <span className="badge-low flex items-center space-x-1"><Info className="w-3 h-3 mr-1" />LOW</span>;
    }
  };

  return (
    <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Predictive Maintenance Alerts</h3>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-amber-400 px-2.5 py-1 rounded border border-amber-500/20">
          {alerts.length} ALERTS ACTIVE
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Vehicle ID</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Diagnostic Message</th>
              <th className="px-4 py-3">Est. Days to Service</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-900/40 transition">
                <td className="px-4 py-3 font-mono font-semibold text-cyan-400">{alert.vehicle_id}</td>
                <td className="px-4 py-3">{getSeverityBadge(alert.severity)}</td>
                <td className="px-4 py-3 font-mono text-slate-300">{alert.category}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{alert.message}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1.5 font-mono text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{alert.predicted_days_to_service} days</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
