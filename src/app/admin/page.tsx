"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Login from "./Login";
import AdminPanel from "./components/AdminPanelClient"; // your project add form

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return (
      <Login
        onLogin={(u?: any) => {
          setUser(u ?? auth.currentUser);
          router.push("/admin/projects");
        }}
      />
    );
  }

  // If user is authenticated, send them to the projects management page.
  router.push("/admin/projects");
  return null;
}
