"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { type Alert, fetchAlerts } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useVehicleId } from "@/lib/useVehicleId";

export default function VehicleAlertsPage() {
  const vehicleId = useVehicleId();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    fetchAlerts(vehicleId, 100)
      .then(setAlerts)
      .catch(() => setError("Could not load alerts for this vehicle."));
  }, [vehicleId]);

  if (error) return <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>;

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
        <CheckCircle2 className="mx-auto mb-2 text-green-500" size={20} />
        No alerts for this vehicle.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
            <th className="px-4 py-2 font-medium">Severity</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Message</th>
            <th className="px-4 py-2 font-medium">Days to service</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Raised</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-b border-gray-50 last:border-0">
              <td className="px-4 py-3">
                <SeverityBadge severity={alert.severity} />
              </td>
              <td className="px-4 py-3 text-gray-600">{alert.category}</td>
              <td className="px-4 py-3 text-gray-800">{alert.message}</td>
              <td className="px-4 py-3 font-medium [font-variant-numeric:tabular-nums]">
                {alert.predicted_days_to_service}
              </td>
              <td className="px-4 py-3">
                {alert.resolved ? (
                  <span className="text-gray-400">Resolved</span>
                ) : (
                  <span className="font-medium text-amber-600">Active</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400">{formatDateTime(alert.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
