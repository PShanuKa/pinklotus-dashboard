'use client';

import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/lib/store/auth.store";
import { FiBell, FiUser } from "react-icons/fi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center">
            {/* Mobile menu button could go here */}
            <h2 className="text-xl font-semibold text-gray-800 md:hidden">Pink Lotus</h2>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-blue-600 transition-colors relative">
              <FiBell size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l pl-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">{user?.role || "Administrator"}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center font-bold border border-blue-200">
                <FiUser size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
