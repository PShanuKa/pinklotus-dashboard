'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { 
  FiHome, 
  FiBox, 
  FiCalendar, 
  FiUsers, 
  FiLogOut,
  FiMap
} from "react-icons/fi";

const navItems = [
  { name: "Overview", href: "/", icon: FiHome },
  { name: "Hotels", href: "/hotels", icon: FiMap },
  { name: "Rooms", href: "/rooms", icon: FiBox },
  { name: "Bookings", href: "/bookings", icon: FiCalendar },
  { name: "Users", href: "/users", icon: FiUsers },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex flex-col h-full bg-[#111827] text-white w-64 shadow-xl">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-wide">Pink Lotus</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
