"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

const PUBLIC_ROUTES = ["/login"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    if (!token && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
      return;
    }
    // Not a derived-state anti-pattern: this reads an external system
    // (localStorage, unavailable during render/SSR) once per navigation to
    // gate first paint of protected content - exactly the case React's docs
    // call a valid effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [pathname, router]);

  if (PUBLIC_ROUTES.includes(pathname)) return <>{children}</>;
  if (!ready) return null;
  return <>{children}</>;
}
