"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare, Sparkles } from "lucide-react";
import { AIChatPanel } from "@/components/AIChatPanel";

export default function AIAssistantPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
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

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Stellantis Groq AI Diagnostic Advisor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Natural-language dialogue interface powered by Groq with live ECU telemetry context.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-mono">TARGET VEHICLE:</label>
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

      {selectedVehicle ? (
        <AIChatPanel vehicleId={selectedVehicle} />
      ) : (
        <div className="text-center p-8 text-slate-400 text-xs font-mono">Loading connected vehicles...</div>
      )}
    </div>
  );
}
