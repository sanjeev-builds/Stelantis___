import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
});

export type VehicleTelemetry = {
  id: number;
  engine_temp: number;
  battery_voltage: number;
  rpm: number;
  speed: number;
  fuel_level: number;
  odometer: number;
  oil_pressure: number;
  recorded_at: string;
};

export async function fetchTelemetry(limit = 50): Promise<VehicleTelemetry[]> {
  const { data } = await api.get<VehicleTelemetry[]>("/vehicles/", {
    params: { limit },
  });
  return data;
}
