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
      <div className="admin-panel flex items-center justify-center h-screen bg-slate-950 text-slate-300">
        <div className="space-y-3 w-64">
          <div className="h-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const authorized = userEmail === ADMIN_EMAIL;

  // If not authorized, render children only (Login page will be shown there).
  if (!authorized) {
    return <div className="admin-panel min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">{children}</div>;
  }

  return (
    <div className="admin-panel bg-slate-950 text-slate-200 flex h-screen overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* Mobile hamburger: appears fixed in top-left on small screens so the toggle is accessible from the navbar area */}
      <button
        aria-label="Toggle sidebar"
        onClick={() => setIsSidebarOpen((s) => !s)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800/80 backdrop-blur-sm p-2 rounded-md shadow-md text-slate-200 border border-white/10"
      >
        <Menu size={20} />
      </button>

      <div className="flex flex-col flex-1 transition-all duration-300">
        <header className="flex items-center justify-between bg-slate-900/70 backdrop-blur-md shadow-md px-6 py-4 border-b border-white/10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-300 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-semibold text-lg text-slate-100">Admin Dashboard</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/40">{children}</main>
      </div>
    </div>
  );
}
