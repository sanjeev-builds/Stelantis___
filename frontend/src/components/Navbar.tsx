import { Bell, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-base font-medium">Overview</h1>
      <div className="flex items-center gap-4 text-gray-500">
        <Bell size={20} />
        <div className="flex items-center gap-2">
          <User size={20} />
          <span className="text-sm">Team</span>
        </div>
      </div>
    </header>
  );
}
