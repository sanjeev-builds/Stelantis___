"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { AlertsTable } from "@/components/AlertsTable";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/alerts");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Predictive Maintenance & Risk Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated degradation slope analysis and rule-triggered failure predictions before breakdown occurs.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      <AlertsTable alerts={alerts} />
    </div>
  );
}
