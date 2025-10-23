"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc, DocumentData } from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface AdminInfo {
  description: string;
  email: string;
  facebook: string;
  fullName: string;
  github: string;
  initialName: string;
  instagram: string;
  linkedin: string;
  location: string;
  portfolio: string;
  techStacks: string[];
}

const defaultInfo: AdminInfo = {
  description: "",
  email: "",
  facebook: "",
  fullName: "",
  github: "",
  initialName: "",
  instagram: "",
  linkedin: "",
  location: "",
  portfolio: "",
  techStacks: [],
};

export default function AdminMyInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [docId, setDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState<AdminInfo>(defaultInfo);

  const ADMIN_EMAIL = "pjramyanath@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  async function loadInfo() {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "my-information"));
      if (snap.empty) {
        const ref = await addDoc(collection(db, "my-information"), fields);
        setDocId(ref.id);
      } else {
        const d = snap.docs[0];
        setDocId(d.id);
        const data = d.data() as Partial<AdminInfo>;
        setFields({
          description: data.description ?? "",
          email: data.email ?? "",
          facebook: data.facebook ?? "",
          fullName: data.fullName ?? "",
          github: data.github ?? "",
          initialName: data.initialName ?? "",
          instagram: data.instagram ?? "",
          linkedin: data.linkedin ?? "",
          location: data.location ?? "",
          portfolio: data.portfolio ?? "",
          techStacks: Array.isArray(data.techStacks) ? data.techStacks : [],
        });
      }
    } catch (err: unknown) {
      console.error("Failed to load my-information:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const handleFieldChange = <K extends keyof AdminInfo>(key: K, value: AdminInfo[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const addTech = (t: string) => {
    if (!t) return;
    setFields((prev) => ({ ...prev, techStacks: [...prev.techStacks, t] }));
  };

  const removeTech = (i: number) => {
    setFields((prev) => ({ ...prev, techStacks: prev.techStacks.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    if (!docId) return;
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "my-information", docId), fields as DocumentData);
      await loadInfo();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loadingUser) return <p>Loading...</p>;

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="text-center mt-20 text-red-500">
        Access Denied. You are not authorized to view this page.
        <div className="mt-4">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Edit My Information</h2>

        {loading ? (
          <div>Loading information...</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(fields).map(([key, value]) =>
              key !== "techStacks" ? (
                <label key={key} className="block">
                  <span className="text-sm font-medium">{key}</span>
                  {typeof value === "string" ? (
                    <input
                      value={value}
                      onChange={(e) => handleFieldChange(key as keyof AdminInfo, e.target.value)}
                      className="w-full border px-3 py-2 rounded mt-1"
                    />
                  ) : null}
                </label>
              ) : null
            )}

            <div>
              <span className="text-sm font-medium">Tech stacks</span>
              <div className="mt-2 flex gap-2 flex-wrap">
                {fields.techStacks.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    <span>{t}</span>
                    <button type="button" onClick={() => removeTech(i)} className="text-sm text-indigo-600">
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input id="newTech" placeholder="Add tech (e.g. node)" className="flex-1 border px-3 py-2 rounded" />
                <button
                  onClick={() => {
                    const el = document.getElementById("newTech") as HTMLInputElement | null;
                    if (el) {
                      addTech(el.value.trim());
                      el.value = "";
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={loadInfo} className="px-4 py-2 bg-gray-200 rounded">
                Reload
              </button>
            </div>

            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
