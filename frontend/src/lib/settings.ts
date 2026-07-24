export const DEFAULT_VEHICLE_KEY = "vhd:defaultVehicleId";
export const REFRESH_INTERVAL_KEY = "vhd:refreshIntervalMs";

export const REFRESH_INTERVAL_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
  { label: "60s", value: 60_000 },
] as const;
