"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface TelemetryChartsProps {
  data: any[];
}

export function TelemetryCharts({ data }: TelemetryChartsProps) {
  const formattedData = [...data].reverse().map((d) => ({
    time: d.timestamp ? new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    batteryTemp: d.battery_temp_c,
    voltage: d.battery_voltage,
    coolantTemp: d.coolant_temp_c,
    cpuUsage: d.cpu_usage_pct,
    canErrors: d.can_bus_error_count,
    speed: d.speed_kmh,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Battery Thermal & Voltage Trend */}
      <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200">Battery Thermal & Pack Voltage</h4>
          <span className="text-xs text-cyan-400 font-mono">HV BATTERY</span>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="voltGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
              />
              <Area type="monotone" dataKey="batteryTemp" name="Temp (°C)" stroke="#f59e0b" fillOpacity={1} fill="url(#tempGradient)" />
              <Area type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#38bdf8" fillOpacity={1} fill="url(#voltGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ECU CPU Usage & CAN Errors */}
      <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200">ECU Performance & CAN Errors</h4>
          <span className="text-xs text-emerald-400 font-mono">SYSTEM BUS</span>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
              />
              <Line type="monotone" dataKey="cpuUsage" name="CPU Usage (%)" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="canErrors" name="CAN Errors" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
