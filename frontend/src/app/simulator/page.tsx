"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Sliders, Sparkles, AlertTriangle, Shield, Thermometer, Zap, Activity, CheckCircle2 } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";

export default function CustomSimulatorPage() {
  const [model, setModel] = useState("Jeep Avenger EV");

  // BATTERY & POWER SYSTEM
  const [batteryCharge, setBatteryCharge] = useState(95);
  const [batteryVoltage, setBatteryVoltage] = useState(380.0);
  const [batteryTemp, setBatteryTemp] = useState(25.0);

  // ENGINE & DRIVING PERFORMANCE
  const [coolantTemp, setCoolantTemp] = useState(85.0);
  const [oilPressure, setOilPressure] = useState(350.0);
  const [ecuTemp, setEcuTemp] = useState(35.0);
  const [speed, setSpeed] = useState(74);
  const [motorRpm, setMotorRpm] = useState(2500);
  const [engineLoad, setEngineLoad] = useState(15);

  // ECU & COMPUTING RESOURCES
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(25);

  // CYBERSECURITY & BUS
  const [canErrors, setCanErrors] = useState(0);
  const [authViolations, setAuthViolations] = useState(0);
  const [encryptionStatus, setEncryptionStatus] = useState("ENABLED");

  // LOCATION DETAILS
  const [gpsLat, setGpsLat] = useState(45.0678);
  const [gpsLng, setGpsLng] = useState(7.6825);

  // Active Fault Codes
  const [faultCodesText, setFaultCodesText] = useState("None");

  const [simulationResult, setSimulationResult] = useState<any>(null);

  const runSimulation = async () => {
    try {
      const parsedFaults =
        faultCodesText && faultCodesText.trim().toLowerCase() !== "none"
          ? faultCodesText.split(",").map((c) => c.trim()).filter((c) => c.length > 0)
          : [];

      const payload = {
        model,
        battery_pct: batteryCharge,
        battery_voltage: batteryVoltage,
        battery_temp_c: batteryTemp,
        ecu_temp_c: ecuTemp,
        cpu_usage_pct: cpuUsage,
        ram_usage_pct: ramUsage,
        coolant_temp_c: coolantTemp,
        oil_pressure_kpa: oilPressure,
        engine_load_pct: engineLoad,
        encryption_status: encryptionStatus,
        can_bus_error_count: canErrors,
        auth_attempts: authViolations,
        mileage_km: 25000.0,
        fault_codes: parsedFaults,
      };

      const res = await axios.post("http://localhost:8000/api/simulate", payload);
      setSimulationResult(res.data);
    } catch (err) {
      console.error("Simulation request error", err);
    }
  };

  useEffect(() => {
    // Re-runs the deterministic scoring engine on the backend whenever a
    // slider changes - synchronizing with an external system (the scoring
    // engine), the valid effect case. runSimulation is intentionally
    // omitted from deps: it's redefined every render, so including it
    // would refetch on every render instead of only on slider changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    batteryCharge,
    batteryVoltage,
    batteryTemp,
    coolantTemp,
    oilPressure,
    ecuTemp,
    speed,
    motorRpm,
    engineLoad,
    cpuUsage,
    ramUsage,
    canErrors,
    authViolations,
    encryptionStatus,
    faultCodesText,
  ]);

  const applyPreset = (type: string) => {
    if (type === "nominal") {
      setBatteryCharge(95);
      setBatteryVoltage(380.0);
      setBatteryTemp(25.0);
      setCoolantTemp(85.0);
      setOilPressure(350.0);
      setEcuTemp(35.0);
      setSpeed(74);
      setMotorRpm(2500);
      setEngineLoad(15);
      setCpuUsage(12);
      setRamUsage(25);
      setCanErrors(0);
      setAuthViolations(0);
      setEncryptionStatus("ENABLED");
      setFaultCodesText("None");
    } else if (type === "warning") {
      setBatteryCharge(65);
      setBatteryVoltage(355.0);
      setBatteryTemp(48.5);
      setCoolantTemp(94.0);
      setOilPressure(320.0);
      setEcuTemp(45.0);
      setSpeed(95);
      setMotorRpm(3400);
      setEngineLoad(60);
      setCpuUsage(45);
      setRamUsage(50);
      setCanErrors(12);
      setAuthViolations(2);
      setEncryptionStatus("ENABLED");
      setFaultCodesText("P0A7F");
    } else if (type === "critical") {
      setBatteryCharge(35);
      setBatteryVoltage(320.0);
      setBatteryTemp(62.0);
      setCoolantTemp(108.0);
      setOilPressure(210.0);
      setEcuTemp(68.0);
      setSpeed(110);
      setMotorRpm(4800);
      setEngineLoad(85);
      setCpuUsage(88);
      setRamUsage(82);
      setCanErrors(28);
      setAuthViolations(8);
      setEncryptionStatus("DISABLED");
      setFaultCodesText("P0A80, U0100");
    }
  };

  const getSubStatus = (score: number) => {
    if (score >= 80) return <span className="text-emerald-400 font-semibold">Good</span>;
    if (score >= 60) return <span className="text-amber-400 font-semibold">Watch</span>;
    return <span className="text-red-400 font-semibold">Critical</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Sensor Telemetry Form</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Adjust sensor parameters & submit live data to verify health score predictions.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset("nominal")}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold font-mono transition"
          >
            🟢 Factory Nominal
          </button>
          <button
            onClick={() => applyPreset("warning")}
            className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-semibold font-mono transition"
          >
            🟡 Thermal Watch
          </button>
          <button
            onClick={() => applyPreset("critical")}
            className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold font-mono transition"
          >
            🔴 Cyber & Battery Critical
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Panel (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200">Sensor Telemetry Form</h3>
            <span className="text-xs text-slate-400 font-mono">Adjust parameters & submit</span>
          </div>

          {/* 1. BATTERY & POWER SYSTEM */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">BATTERY & POWER SYSTEM</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex justify-between">
                  <span>Battery Charge (%):</span>
                  <span className="text-cyan-400 font-bold">{batteryCharge}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={batteryCharge}
                  onChange={(e) => setBatteryCharge(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Battery Voltage (V)</label>
                <input
                  type="number"
                  step="0.1"
                  value={batteryVoltage}
                  onChange={(e) => setBatteryVoltage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Battery Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={batteryTemp}
                  onChange={(e) => setBatteryTemp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* 2. ENGINE & DRIVING PERFORMANCE */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">ENGINE & DRIVING PERFORMANCE</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Coolant Temp (°C)</label>
                <input
                  type="number"
                  step="1"
                  value={coolantTemp}
                  onChange={(e) => setCoolantTemp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Oil Pressure (kPa)</label>
                <input
                  type="number"
                  step="10"
                  value={oilPressure}
                  onChange={(e) => setOilPressure(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">ECU Temp (°C)</label>
                <input
                  type="number"
                  step="1"
                  value={ecuTemp}
                  onChange={(e) => setEcuTemp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Speed (km/h)</label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Motor RPM</label>
                <input
                  type="number"
                  value={motorRpm}
                  onChange={(e) => setMotorRpm(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex justify-between">
                  <span>Engine Load (%):</span>
                  <span className="text-cyan-400 font-bold">{engineLoad}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={engineLoad}
                  onChange={(e) => setEngineLoad(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. ECU & COMPUTING RESOURCES */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">ECU & COMPUTING RESOURCES</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex justify-between">
                  <span>CPU Usage (%):</span>
                  <span className="text-cyan-400 font-bold">{cpuUsage}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cpuUsage}
                  onChange={(e) => setCpuUsage(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex justify-between">
                  <span>RAM Usage (%):</span>
                  <span className="text-cyan-400 font-bold">{ramUsage}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ramUsage}
                  onChange={(e) => setRamUsage(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. CYBERSECURITY & BUS */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">CYBERSECURITY & BUS</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">CAN Bus Error Count</label>
                <input
                  type="number"
                  value={canErrors}
                  onChange={(e) => setCanErrors(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Auth Violations</label>
                <input
                  type="number"
                  value={authViolations}
                  onChange={(e) => setAuthViolations(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Encryption Status</label>
                <select
                  value={encryptionStatus}
                  onChange={(e) => setEncryptionStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="ENABLED">ENABLED</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. LOCATION DETAILS */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">LOCATION DETAILS</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">GPS Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={gpsLat}
                  onChange={(e) => setGpsLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={gpsLng}
                  onChange={(e) => setGpsLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* 6. ACTIVE FAULT CODES */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-mono text-slate-300">Active Fault Codes (comma-separated, e.g. P0300, B1000)</label>
            <input
              type="text"
              value={faultCodesText}
              onChange={(e) => setFaultCodesText(e.target.value)}
              placeholder="e.g. P0A80, U0100 or None"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Right Computed Health Scores Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {simulationResult && (
            <>
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-6">
                <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
                  Computed Health Scores
                </h3>

                {/* Vehicle Health Gauge */}
                <div className="flex flex-col items-center justify-center p-3 glass-card rounded-xl border border-slate-800/80">
                  <ScoreGauge score={simulationResult.vehicle_health_score} label="Vehicle Health" size={130} />
                  <div className="mt-1 text-center font-mono text-xs">
                    {getSubStatus(simulationResult.vehicle_health_score)}
                  </div>
                </div>

                {/* Battery Health Gauge */}
                <div className="flex flex-col items-center justify-center p-3 glass-card rounded-xl border border-slate-800/80">
                  <ScoreGauge score={simulationResult.battery_health_score} label="Battery Health" size={130} />
                  <div className="mt-1 text-center font-mono text-xs">
                    {getSubStatus(simulationResult.battery_health_score)}
                  </div>
                </div>

                {/* Cybersecurity Gauge */}
                <div className="flex flex-col items-center justify-center p-3 glass-card rounded-xl border border-slate-800/80">
                  <ScoreGauge score={simulationResult.cybersecurity_score} label="Cybersecurity" size={130} />
                  <div className="mt-1 text-center font-mono text-xs">
                    {getSubStatus(simulationResult.cybersecurity_score)}
                  </div>
                </div>
              </div>

              {/* Deterministic Diagnostic Summary Box - /simulate never calls the
                  LLM (see actions.py), so this must not be attributed to AI. */}
              <div className="glass-card p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
                    Scoring Engine Rationale
                  </h4>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{simulationResult.ai_summary}</p>
              </div>

              {/* Active Predictive Alerts */}
              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
                    Active Predictive Alerts
                  </h4>
                  <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                    {simulationResult.triggered_alerts.length}
                  </span>
                </div>

                {simulationResult.triggered_alerts.length === 0 ? (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/50">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Parameters are nominal. No predictive alerts triggered.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {simulationResult.triggered_alerts.map((alert: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                        <span className={alert.severity === "CRITICAL" ? "badge-critical" : "badge-high"}>
                          {alert.severity} • {alert.category}
                        </span>
                        <p className="text-slate-200 font-medium">{alert.message}</p>
                        <p className="font-mono text-amber-400 text-[10px]">Predicted days to service: {alert.predicted_days_to_service} days</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
