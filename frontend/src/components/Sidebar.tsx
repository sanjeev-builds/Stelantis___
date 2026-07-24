"use client";

import { Gauge, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", icon: Gauge, href: "/" },
  { label: "AI Assistant", icon: MessageCircle, href: "/assistant" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-8 px-2 text-lg font-semibold text-brand">Vehicle Health</div>
      <nav className="flex flex-col gap-1">
        {links.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                active ? "bg-brand/10 text-brand" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
