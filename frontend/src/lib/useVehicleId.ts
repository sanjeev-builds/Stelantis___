"use client";

import { usePathname } from "next/navigation";

/** Reads the vehicle id straight from the URL (/vehicles/{id}/...) instead of
 * the Next.js `params` prop, which is a Promise as of Next 15+ and needs
 * React 19's `use()` to unwrap in a client component - this repo is pinned
 * to React 18, so this sidesteps that mismatch entirely. */
export function useVehicleId(): string {
  const pathname = usePathname();
  return pathname.split("/")[2] ?? "";
}
