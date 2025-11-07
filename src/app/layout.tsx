"use client"

import "./globals.css"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

// metadata is provided from a server `head.tsx` file to avoid exporting
// metadata from a client component (Next.js disallows this).

const ADMIN_EMAIL = "pjramyanath@gmail.com"

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Only subscribe to auth changes when on admin routes to avoid unnecessary listeners.
    if (!isAdminPath) {
      setLoadingAuth(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, [isAdminPath]);

  const authorized = userEmail === ADMIN_EMAIL;

  // Hide Navbar/Footer while on admin path and auth is loading or when authorized
  const showShell = !(isAdminPath && (loadingAuth || authorized));

  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-slate-950 text-slate-200 antialiased min-h-screen">
        {showShell && <Navbar />}

        {/* Add top padding so fixed navbar doesn't overlap content on small screens */}
        <div className={`${showShell ? "pt-16 md:pt-16" : ""}`}>{children}</div>

        {showShell && <Footer />}
      </body>
    </html>
  )
}
