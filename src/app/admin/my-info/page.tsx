"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AdminMyInfoPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [docId, setDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState<any>({
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
    techStacks: [] as string[],
  });

  const ADMIN_EMAIL = "pjramyanath@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserEmail(u?.email ?? null);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadInfo();
  }, []);

  async function loadInfo() {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "my-information"));
      if (snap.empty) {
        // create empty doc
        const ref = await addDoc(collection(db, "my-information"), fields);
        setDocId(ref.id);
      } else {
        const d = snap.docs[0];
        setDocId(d.id);
        const data = d.data() as any;
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
    } catch (err: any) {
      console.error("Failed to load my-infomation:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const handleFieldChange = (k: string, v: any) => {
    setFields((prev: any) => ({ ...prev, [k]: v }));
  };

  const addTech = (t: string) => {
    if (!t) return;
    setFields((prev: any) => ({ ...prev, techStacks: [...(prev.techStacks || []), t] }));
  };

  const removeTech = (i: number) => {
    setFields((prev: any) => ({ ...prev, techStacks: (prev.techStacks || []).filter((_: any, idx: number) => idx !== i) }));
  };

  const handleSave = async () => {
    if (!docId) return;
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "my-information", docId), fields);
      setSaving(false);
      await loadInfo();
    } catch (err: any) {
      setError(err.message || String(err));
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loadingUser) return <p>Loading...</p>;

  if (userEmail !== ADMIN_EMAIL) {
    return (
      <div className="text-center mt-20 text-red-500">
        Access Denied. You are not authorized to view this page.
        <div className="mt-4">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Logout</button>
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
            <label className="block">
              <span className="text-sm font-medium">Full name</span>
              <input value={fields.fullName} onChange={(e) => handleFieldChange("fullName", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Initial name</span>
              <input value={fields.initialName} onChange={(e) => handleFieldChange("initialName", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input value={fields.email} onChange={(e) => handleFieldChange("email", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Location</span>
              <input value={fields.location} onChange={(e) => handleFieldChange("location", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Portfolio</span>
              <input value={fields.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">GitHub</span>
              <input value={fields.github} onChange={(e) => handleFieldChange("github", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">LinkedIn</span>
              <input value={fields.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Instagram</span>
              <input value={fields.instagram} onChange={(e) => handleFieldChange("instagram", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Facebook</span>
              <input value={fields.facebook} onChange={(e) => handleFieldChange("facebook", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Description</span>
              <textarea value={fields.description} onChange={(e) => handleFieldChange("description", e.target.value)} className="w-full border px-3 py-2 rounded mt-1" rows={4} />
            </label>

            <div>
              <span className="text-sm font-medium">Tech stacks</span>
              <div className="mt-2 flex gap-2 flex-wrap">
                {(fields.techStacks || []).map((t: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    <span>{t}</span>
                    <button type="button" onClick={() => removeTech(i)} className="text-sm text-indigo-600">×</button>
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input id="newTech" placeholder="Add tech (e.g. node)" className="flex-1 border px-3 py-2 rounded" />
                <button onClick={() => { const el = document.getElementById("newTech") as HTMLInputElement | null; if (el) { addTech(el.value.trim()); el.value = ""; } }} className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">{saving ? "Saving..." : "Save"}</button>
              <button onClick={loadInfo} className="px-4 py-2 bg-gray-200 rounded">Reload</button>
            </div>

            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}