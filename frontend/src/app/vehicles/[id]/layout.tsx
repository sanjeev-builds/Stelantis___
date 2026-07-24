"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { VehicleNav } from "@/components/VehicleNav";
import { type Vehicle, fetchVehicle } from "@/lib/api";
import { useVehicleId } from "@/lib/useVehicleId";

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  const vehicleId = useVehicleId();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    fetchVehicle(vehicleId)
      .then(setVehicle)
      .catch(() => setVehicle(null));
  }, [vehicleId]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold">{vehicle ? vehicle.model : vehicleId}</h1>
            <p className="text-sm text-gray-500">{vehicleId}</p>
          </div>
          <VehicleNav vehicleId={vehicleId} />
          {children}
        </main>
      </div>
    </div>
  );
}
