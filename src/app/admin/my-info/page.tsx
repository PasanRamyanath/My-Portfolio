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
    passions: [] as string[],
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
          passions: Array.isArray(data.passions) ? data.passions : [],
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

  const addPassion = (p: string) => {
    if (!p) return;
    const newPassions = [...(fields.passions || []), p];
    setFields((prev: any) => ({ ...prev, passions: newPassions }));
    // persist immediately if we have a docId
    if (docId) {
      updateDoc(doc(db, "my-information", docId), { passions: newPassions }).catch((err) => {
        console.warn("Failed to persist passions immediately:", err);
      });
    }
  };

  const removePassion = (i: number) => {
    const newPassions = (fields.passions || []).filter((_: any, idx: number) => idx !== i);
    setFields((prev: any) => ({ ...prev, passions: newPassions }));
    if (docId) {
      updateDoc(doc(db, "my-information", docId), { passions: newPassions }).catch((err) => {
        console.warn("Failed to persist passions immediately:", err);
      });
    }
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

  if (loadingUser) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="space-y-3 w-64">
        <div className="h-4 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );

  if (userEmail !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-rose-400">
        <div className="bg-slate-900/60 p-6 rounded-lg border border-white/10 text-center max-w-sm">
          <div className="font-semibold mb-2">Access Denied</div>
          <p className="text-sm mb-4">You are not authorized to view this page.</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-rose-600 text-white rounded-lg">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 text-slate-100">
      <div className="bg-slate-900/70 rounded-xl shadow p-6 border border-white/10 backdrop-blur-md">
        <h2 className="text-2xl font-semibold mb-4 text-slate-100">Edit My Information</h2>

        {loading ? (
          <div>Loading information...</div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Full name</span>
              <input value={fields.fullName} onChange={(e) => handleFieldChange("fullName", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Initial name</span>
              <input value={fields.initialName} onChange={(e) => handleFieldChange("initialName", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Email</span>
              <input value={fields.email} onChange={(e) => handleFieldChange("email", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Location</span>
              <input value={fields.location} onChange={(e) => handleFieldChange("location", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Portfolio</span>
              <input value={fields.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">GitHub</span>
              <input value={fields.github} onChange={(e) => handleFieldChange("github", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">LinkedIn</span>
              <input value={fields.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Instagram</span>
              <input value={fields.instagram} onChange={(e) => handleFieldChange("instagram", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Facebook</span>
              <input value={fields.facebook} onChange={(e) => handleFieldChange("facebook", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Description</span>
              <textarea value={fields.description} onChange={(e) => handleFieldChange("description", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" rows={4} />
            </label>

            <div>
              <span className="text-sm font-medium">Tech stacks</span>
              <div className="mt-2 flex gap-2 flex-wrap">
                {(fields.techStacks || []).map((t: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-600/30">
                    <span>{t}</span>
                    <button type="button" onClick={() => removeTech(i)} className="text-sm text-indigo-600">×</button>
                  </span>
                ))}
              </div>

              
              <div className="mt-3 flex gap-2">
                <input id="newTech" placeholder="Add tech (e.g. node)" className="flex-1 bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100 placeholder-slate-400" />
                <button onClick={() => { const el = document.getElementById("newTech") as HTMLInputElement | null; if (el) { addTech(el.value.trim()); el.value = ""; } }} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">Add</button>
              </div>

              <span className="text-sm font-medium">Passions</span>
              <div className="mt-2 flex gap-2 flex-wrap">
                {(fields.passions || []).map((p: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full border border-pink-600/30">
                    <span>{p}</span>
                    <button type="button" onClick={() => removePassion(i)} className="text-sm text-indigo-600">×</button>
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input id="newPassion" placeholder="Add passion (e.g. music)" className="flex-1 bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100 placeholder-slate-400" />
                <button onClick={() => { const el = document.getElementById("newPassion") as HTMLInputElement | null; if (el) { addPassion(el.value.trim()); el.value = ""; } }} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">Add</button>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
              <button onClick={loadInfo} className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600">Reload</button>
            </div>

            {error && <div className="text-rose-400 mt-2">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}