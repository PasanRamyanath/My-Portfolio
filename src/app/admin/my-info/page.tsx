"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ConfirmModal from "@/app/admin/components/ConfirmModal";

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
    phone: "",
    facebook: "",
    fullName: "",
    github: "",
    huggingFace: "",
    initialName: "",
    instagram: "",
    linkedin: "",
    location: "",
    portfolio: "",
    shortDescription: "",
    aboutMeDescription: "",
    techStacks: {} as Record<string, string[]>,
    passions: [] as string[],
  });

  const [selectedTechCategory, setSelectedTechCategory] = useState<string>("__new__");
  const [newTechValue, setNewTechValue] = useState<string>("");
  const [newTechCategory, setNewTechCategory] = useState<string>("");
  const [newTechImage, setNewTechImage] = useState<File | null>(null);
  const newTechFileRef = React.useRef<HTMLInputElement | null>(null);

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
        // normalize techStacks into an object of arrays of items { name, image?, fileId? }
        let techStacks: Record<string, Array<any>> = {};
        if (Array.isArray(data.techStacks)) {
          techStacks = { General: data.techStacks.map((s: any) => (typeof s === 'string' ? { name: s } : s)) };
        } else if (data.techStacks && typeof data.techStacks === 'object') {
          techStacks = Object.entries(data.techStacks).reduce((acc: any, [k, v]: any) => {
            if (Array.isArray(v)) {
              acc[k] = v.map((it: any) => {
                if (typeof it === 'string') return { name: it };
                if (it && typeof it === 'object') return { name: it.name ?? (it.url ? String(it.url) : ''), image: it.image ?? it.url, fileId: it.fileId };
                return { name: String(it) };
              });
            } else acc[k] = [];
            return acc;
          }, {} as Record<string, Array<any>>);
        } else {
          techStacks = {};
        }

        setFields({
          description: data.description ?? "",
          shortDescription: data.shortDescription ?? "",
          aboutMeDescription: data.aboutMeDescription ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          facebook: data.facebook ?? "",
          fullName: data.fullName ?? "",
          github: data.github ?? "",
          huggingFace: data.huggingFace ?? "",
          initialName: data.initialName ?? "",
          instagram: data.instagram ?? "",
          linkedin: data.linkedin ?? "",
          location: data.location ?? "",
          portfolio: data.portfolio ?? "",
          techStacks,
          passions: Array.isArray(data.passions) ? data.passions : [],
        });

  // set default selected category (if none, default to creating a new one)
  const cats = Object.keys(techStacks);
  setSelectedTechCategory(cats.length > 0 ? cats[0] : '__new__');
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

  const uploadFile = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      return { url: data.url, fileId: data.fileId };
    } catch (e) {
      console.warn('Upload failed', e);
      return null;
    }
  };

  const addTech = async (t: string) => {
    if (!t) return;
    const cat = selectedTechCategory === '__new__' ? (newTechCategory.trim() || 'General') : selectedTechCategory;
    let item: any = { name: t };
    if (newTechImage) {
      const uploaded = await uploadFile(newTechImage);
      if (uploaded) item = { ...item, image: uploaded.url, fileId: uploaded.fileId };
    }
    setFields((prev: any) => {
      const current: Record<string, any[]> = prev.techStacks || {};
      const updated = { ...current };
      if (!updated[cat]) updated[cat] = [];
      updated[cat] = [...updated[cat], item];
      return { ...prev, techStacks: updated };
    });
    setNewTechValue('');
    setNewTechCategory('');
    setNewTechImage(null);
    try { if (newTechFileRef.current) newTechFileRef.current.value = ''; } catch (_) {}
  };

  const removeTech = async (category: string, i: number) => {
    const item = (fields.techStacks?.[category] || [])[i];
    if (item && item.fileId) {
      try {
        await fetch('/api/upload/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fileId: item.fileId }) });
      } catch (err) {
        console.warn('Failed to delete tech image', err);
      }
    }
    setFields((prev: any) => {
      const current: Record<string, any[]> = prev.techStacks || {};
      const updated = { ...current };
      if (!updated[category]) return prev;
      updated[category] = updated[category].filter((_: any, idx: number) => idx !== i);
      if (updated[category].length === 0) delete updated[category];
      return { ...prev, techStacks: updated };
    });
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
    // replaced by popup flow
    setShowConfirm(true);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const performLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      setShowConfirm(false);
    }
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
          <ConfirmModal
            open={showConfirm}
            title="Log out"
            message="Are you sure you want to log out?"
            confirmLabel="Log out"
            cancelLabel="Cancel"
            onConfirm={performLogout}
            onCancel={() => setShowConfirm(false)}
          />
          <button onClick={() => setShowConfirm(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg">Logout</button>
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
              <span className="text-sm font-medium text-slate-300">Phone</span>
              <input value={fields.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" placeholder="+94 77 123 4567" />
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
              <span className="text-sm font-medium text-slate-300">Hugging Face</span>
              <input value={fields.huggingFace} onChange={(e) => handleFieldChange("huggingFace", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" placeholder="https://huggingface.co/your-profile" />
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

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Short description</span>
              <input value={fields.shortDescription} onChange={(e) => handleFieldChange("shortDescription", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">About me description</span>
              <textarea value={fields.aboutMeDescription} onChange={(e) => handleFieldChange("aboutMeDescription", e.target.value)} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400" rows={6} />
            </label>

            <div>
              <span className="text-sm font-medium">Tech stacks</span>
              <div className="mt-2 space-y-3">
                {Object.keys(fields.techStacks || {}).length === 0 ? (
                  <div className="text-sm text-slate-400">No tech stacks yet.</div>
                ) : (
                  Object.entries((fields.techStacks || {}) as Record<string, any[]>).map(([cat, items]) => (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-slate-200">{cat}</div>
                        <div className="text-xs text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {items.map((it: any, i: number) => (
                          <div key={`${(it && (it.name || it)) ?? i}`} className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-600/30">
                            {it && it.image ? (
                              <img src={it.image} alt={it.name} className="w-5 h-5 rounded-full object-cover" />
                            ) : null}
                            <span>{typeof it === 'string' ? it : it.name}</span>
                            <button type="button" onClick={() => removeTech(cat, i)} className="text-sm text-indigo-600">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <input
                  value={newTechValue}
                  onChange={(e) => setNewTechValue(e.target.value)}
                  placeholder="Add tech (e.g. node)"
                  className="col-span-2 w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTechCategory}
                    onChange={(e) => setSelectedTechCategory(e.target.value)}
                    className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100"
                  >
                    {Object.keys(fields.techStacks || {}).map((c) => (
                      <option value={c} key={c}>{c}</option>
                    ))}
                    <option value="__new__">Create new category...</option>
                  </select>
                </div>

                {selectedTechCategory === '__new__' && (
                  <input
                    value={newTechCategory}
                    onChange={(e) => setNewTechCategory(e.target.value)}
                    placeholder="New category name"
                    className="col-span-3 w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded mt-1 text-slate-100 placeholder-slate-400"
                  />
                )}

                <div className="col-span-3 flex items-center gap-2">
                  <input
                    ref={newTechFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewTechImage(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100"
                  />
                </div>

                <div className="col-span-3 flex justify-end">
                  <button
                    onClick={async () => {
                      if (!newTechValue.trim()) return;
                      const tech = newTechValue.trim();
                      await addTech(tech);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                  >
                    Add
                  </button>
                </div>
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