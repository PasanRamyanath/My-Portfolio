"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Login from "./Login";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const ADMIN_EMAIL = "pjramyanath@gmail.com";
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Only consider the user authenticated for admin if the email matches
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setUser(currentUser);
      } else {
        // If there is a signed-in user but it's not the admin, sign them out to avoid transient auth state
        if (currentUser) {
          try {
            await signOut(auth);
          } catch (err) {
            // ignore
          }
        }
        setUser(null);
      }
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
        onLogin={(u?: User) => {
          setUser(u ?? auth.currentUser);
          // Redirect effect above will handle navigation
        }}
      />
    );
  }

  return <p>Redirecting...</p>; // Optional placeholder while redirecting
}
