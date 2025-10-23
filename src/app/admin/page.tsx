"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Login from "./Login";

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

  // Redirect effect for authenticated users
  useEffect(() => {
    if (user) {
      router.push("/admin/projects");
    }
  }, [user, router]);

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return (
      <Login
        onLogin={(u?: any) => {
          setUser(u ?? auth.currentUser);
          // The effect above will handle redirect automatically
        }}
      />
    );
  }

  return <p>Redirecting...</p>; // Optional placeholder while redirecting
}
