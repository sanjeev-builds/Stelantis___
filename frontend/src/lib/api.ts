import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
});

// Attaches the JWT LoginForm stores on sign-in, so the (now auth-guarded)
// POST /reset-demo-data actually authenticates instead of 401ing silently.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function isLoggedIn(): boolean {
  return typeof window !== "undefined" && Boolean(localStorage.getItem("access_token"));
}

export function logout(): void {
  localStorage.removeItem("access_token");
}

export type Vehicle = {
  vehicle_id: string;
  model: string;
  manufacture_year: number;
  firmware_version: string;
  mileage_km: number;
  charge_cycles: number;
};

export type Telemetry = {
  id: number;
  vehicle_id: string;
  timestamp: string;
  battery_pct: number;
  battery_voltage: number;
  battery_temp_c: number;
  ecu_temp_c: number;
  cpu_usage_pct: number;
  ram_usage_pct: number;
  speed_kmh: number;
  motor_rpm: number;
  engine_load_pct: number;
  coolant_temp_c: number;
  oil_pressure_kpa: number;
  fault_codes: string[];
  encryption_status: "ENABLED" | "DISABLED";
  can_bus_error_count: number;
  unauthorized_access_attempts: number;
  gps_lat: number;
  gps_lng: number;
};

export type TelemetryInput = Omit<Telemetry, "id" | "timestamp"> & { timestamp?: string };

export type HealthScore = {
  id: number;
  vehicle_id: string;
  telemetry_id: number;
  vehicle_health_score: number;
  battery_health_score: number;
  cybersecurity_score: number;
  computed_at: string;
};

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertCategory = "BATTERY" | "ECU" | "CYBERSECURITY" | "MECHANICAL";

export type Alert = {
  id: number;
  vehicle_id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  message: string;
  predicted_days_to_service: number;
  created_at: string;
  resolved: boolean;
};

export type FleetSummaryRow = {
  vehicle: Vehicle;
  latest_score: HealthScore | null;
  active_alert_count: number;
};

export type MaintenanceLog = {
  id: number;
  vehicle_id: string;
  recommendation: string;
  ai_explanation: string;
  urgency: "ROUTINE" | "SOON" | "URGENT";
  source: "RULE_ENGINE" | "GEMINI";
  created_at: string;
};

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[]>("/vehicles");
  return data;
}

export async function fetchVehicle(vehicleId: string): Promise<Vehicle> {
  const { data } = await api.get<Vehicle>(`/vehicles/${vehicleId}`);
  return data;
}

export async function fetchFleetSummary(): Promise<FleetSummaryRow[]> {
  const { data } = await api.get<FleetSummaryRow[]>("/fleet-summary");
  return data;
}

export async function fetchTelemetry(vehicleId: string, limit = 100): Promise<Telemetry[]> {
  const { data } = await api.get<Telemetry[]>(`/telemetry/${vehicleId}`, { params: { limit } });
  return data;
}

export async function ingestTelemetry(reading: TelemetryInput): Promise<Telemetry> {
  const { data } = await api.post<Telemetry>("/telemetry", reading);
  return data;
}

export async function fetchHealthScores(vehicleId: string, limit = 100): Promise<HealthScore[]> {
  const { data } = await api.get<HealthScore[]>(`/health/${vehicleId}`, { params: { limit } });
  return data;
}

export async function fetchAlerts(vehicleId: string, limit = 100): Promise<Alert[]> {
  const { data } = await api.get<Alert[]>(`/alerts/${vehicleId}`, { params: { limit } });
  return data;
}

export async function fetchMaintenanceLogs(vehicleId: string, limit = 100): Promise<MaintenanceLog[]> {
  const { data } = await api.get<MaintenanceLog[]>(`/maintenance/${vehicleId}`, { params: { limit } });
  return data;
}

export async function analyzeVehicle(vehicleId: string): Promise<HealthScore> {
  const { data } = await api.post<HealthScore>("/analyze", { vehicle_id: vehicleId });
  return data;
}

export async function predictVehicle(vehicleId: string): Promise<Alert[]> {
  const { data } = await api.post<Alert[]>("/predict", { vehicle_id: vehicleId });
  return data;
}

export async function chatAboutVehicle(vehicleId: string, question: string): Promise<string> {
  const { data } = await api.post<{ answer: string }>("/chat", { vehicle_id: vehicleId, question });
  return data.answer;
}

export async function resetDemoData(): Promise<void> {
  await api.post("/reset-demo-data");
}
