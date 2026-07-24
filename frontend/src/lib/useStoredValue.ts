"use client";

import { useEffect, useState } from "react";

/** Small localStorage-backed preference, used by Settings to drive the
 * default vehicle (Assistant page) and the dashboard refresh interval. */
export function useStoredValue<T>(key: string, initial: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        setValue(JSON.parse(stored) as T);
      } catch {
        // ignore malformed stored value, keep default
      }
    }
  }, [key]);

  function update(next: T) {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  return [value, update];
}
