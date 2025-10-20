"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { Menu } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_EMAIL = "pjramyanath@gmail.com";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // While we don't know auth state, render a minimal loader to avoid
  // flashing the admin chrome briefly.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const authorized = userEmail === ADMIN_EMAIL;

  // If not authorized, render children only (Login page will be shown there).
  if (!authorized) {
    return <div className="min-h-screen bg-gray-100">{children}</div>;
  }

  return (
    <div className="bg-gray-100 text-gray-900 flex h-screen overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* Mobile hamburger: appears fixed in top-left on small screens so the toggle is accessible from the navbar area */}
      <button
        aria-label="Toggle sidebar"
        onClick={() => setIsSidebarOpen((s) => !s)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md text-gray-700"
      >
        <Menu size={20} />
      </button>

      <div className="flex flex-col flex-1 transition-all duration-300">
        <header className="flex items-center justify-between bg-white shadow-md px-6 py-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-semibold text-lg">Admin Dashboard</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
