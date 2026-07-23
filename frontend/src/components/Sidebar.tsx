import { Car, Gauge, Battery, Settings, Users } from "lucide-react";

const links = [
  { label: "Dashboard", icon: Gauge, href: "#" },
  { label: "Vehicles", icon: Car, href: "#" },
  { label: "Battery", icon: Battery, href: "#" },
  { label: "Team", icon: Users, href: "#" },
  { label: "Settings", icon: Settings, href: "#" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-8 px-2 text-lg font-semibold text-brand">Hackathon MVP</div>
      <nav className="flex flex-col gap-1">
        {links.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Icon size={18} />
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
