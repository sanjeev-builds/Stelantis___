"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldAlert, CloudSun, Zap, ExternalLink } from "lucide-react";

interface Recall {
  campaign_number: string | null;
  component: string | null;
  summary: string | null;
  remedy: string | null;
  report_date: string | null;
}

interface AmbientConditions {
  temperature_c: number | null;
  humidity_pct: number | null;
  condition: string;
}

interface ChargingStation {
  name: string | null;
  town: string | null;
  distance_km: number | null;
  num_points: number | null;
  operator: string | null;
}

export function ExternalContextPanel({ vehicleId }: { vehicleId: string }) {
  const [recalls, setRecalls] = useState<Recall[] | null>(null);
  const [environment, setEnvironment] = useState<AmbientConditions | null>(null);
  const [charging, setCharging] = useState<{ configured: boolean; stations: ChargingStation[] } | null>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/vehicles/${vehicleId}/recalls`)
      .then((res) => setRecalls(res.data))
      .catch(() => setRecalls([]));
    axios
      .get(`http://localhost:8000/api/vehicles/${vehicleId}/environment`)
      .then((res) => setEnvironment(res.data))
      .catch(() => setEnvironment(null));
    axios
      .get(`http://localhost:8000/api/vehicles/${vehicleId}/charging-stations`)
      .then((res) => setCharging(res.data))
      .catch(() => setCharging({ configured: false, stations: [] }));
  }, [vehicleId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* NHTSA Recalls */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            NHTSA Recall Check
          </h4>
        </div>
        {recalls === null ? (
          <p className="text-xs text-slate-500">Checking recalls...</p>
        ) : recalls.length === 0 ? (
          <p className="text-xs text-slate-400">
            No open NHTSA recalls found for this make/model/year. US-market Stellantis models only -
            European models correctly return no results here.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {recalls.map((r, i) => (
              <div key={i} className="border-l-2 border-amber-500/50 pl-2.5">
                <p className="text-[11px] font-mono text-amber-400">{r.campaign_number} &middot; {r.component}</p>
                <p className="text-xs text-slate-300 leading-snug">{r.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ambient Weather */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <CloudSun className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Ambient Conditions
          </h4>
        </div>
        {environment === null ? (
          <p className="text-xs text-slate-500">Loading local weather...</p>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">
                {environment.temperature_c ?? "--"}
                <span className="text-sm text-slate-400">&deg;C</span>
              </p>
              <p className="text-xs text-slate-400">{environment.condition}</p>
            </div>
            <p className="text-xs text-slate-400 font-mono">{environment.humidity_pct ?? "--"}% humidity</p>
          </div>
        )}
        <p className="text-[10px] text-slate-500">Context for battery thermal behavior at the vehicle&apos;s last known location.</p>
      </div>

      {/* Nearby Charging */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Nearby Charging
          </h4>
        </div>
        {charging === null ? (
          <p className="text-xs text-slate-500">Looking up stations...</p>
        ) : !charging.configured ? (
          <p className="text-xs text-slate-400 flex items-start space-x-1.5">
            <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              Not configured - add a free{" "}
              <a
                href="https://openchargemap.org/site/develop/api"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Open Charge Map
              </a>{" "}
              key to <code className="text-slate-300">OPENCHARGEMAP_API_KEY</code> to enable this.
            </span>
          </p>
        ) : charging.stations.length === 0 ? (
          <p className="text-xs text-slate-400">No charging stations found within 25km.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {charging.stations.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate">{s.name ?? "Unnamed station"}</span>
                <span className="text-slate-500 font-mono flex-shrink-0 ml-2">
                  {s.distance_km ? `${s.distance_km.toFixed(1)}km` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
