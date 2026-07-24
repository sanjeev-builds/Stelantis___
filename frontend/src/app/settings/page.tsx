"use client";

import { LogOut, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { type Vehicle, fetchVehicles, isLoggedIn, logout, resetDemoData } from "@/lib/api";
import { DEFAULT_VEHICLE_KEY, REFRESH_INTERVAL_KEY, REFRESH_INTERVAL_OPTIONS } from "@/lib/settings";
import { useStoredValue } from "@/lib/useStoredValue";

export default function SettingsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [defaultVehicleId, setDefaultVehicleId] = useStoredValue(DEFAULT_VEHICLE_KEY, "");
  const [refreshMs, setRefreshMs] = useStoredValue(REFRESH_INTERVAL_KEY, 0);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    fetchVehicles()
      .then((list) => {
        setVehicles(list);
        if (!defaultVehicleId && list.length > 0) setDefaultVehicleId(list[0].vehicle_id);
      })
      .catch(() => setVehicles([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReset() {
    setResetting(true);
    setResetMessage(null);
    try {
      await resetDemoData();
      setResetMessage("Mock data regenerated and reseeded.");
    } catch {
      setResetMessage("Reset failed - is the backend running?");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="max-w-xl p-6">
          <h1 className="mb-6 text-xl font-semibold">Settings</h1>

          <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-medium text-gray-700">Default vehicle</h2>
            <p className="mb-3 text-xs text-gray-400">Used to preselect a vehicle in the AI Assistant.</p>
            <select
              value={defaultVehicleId}
              onChange={(e) => setDefaultVehicleId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.vehicle_id} - {v.model}
                </option>
              ))}
            </select>
          </section>

          <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-medium text-gray-700">Dashboard refresh interval</h2>
            <p className="mb-3 text-xs text-gray-400">How often the fleet dashboard re-polls the backend.</p>
            <div className="flex gap-2">
              {REFRESH_INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setRefreshMs(opt.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    refreshMs === opt.value ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-medium text-gray-700">Demo data</h2>
            <p className="mb-3 text-xs text-gray-400">
              Wipes and regenerates all vehicles, telemetry, scores, and alerts from the mock dataset. This is
              destructive, so it requires signing in.
            </p>
            {loggedIn ? (
              <>
                <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Signed in as demo@hackathon.dev</span>
                  <button
                    onClick={() => {
                      logout();
                      setLoggedIn(false);
                    }}
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600"
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                >
                  <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
                  Regenerate mock data
                </button>
                {resetMessage && <p className="mt-2 text-xs text-gray-500">{resetMessage}</p>}
              </>
            ) : (
              <LoginForm onSuccess={() => setLoggedIn(true)} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
