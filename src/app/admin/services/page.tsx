"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Service {
  id?: string;
  title: string;
  description: string;
  // Firestore timestamp representation on client has `seconds` & `nanoseconds`
  createdAt?: { seconds?: number; nanoseconds?: number } | null;
}

function formatServiceDate(ts?: { seconds?: number; nanoseconds?: number } | null) {
  if (!ts) return "Unknown";
  const secs = (ts as any).seconds;
  if (typeof secs === "number") {
    try {
      return new Date(secs * 1000).toLocaleString();
    } catch {
      return "Unknown";
    }
  }
  return "Unknown";
}

export default function AdminServicesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const servicesCol = collection(db, "services");

  async function loadServices() {
    setLoading(true);
    try {
      const snap = await getDocs(servicesCol);
      const items: Service[] = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as Service) }));
      // sort newest first if createdAt exists
      items.sort((a, b) => {
        const at = a.createdAt?.seconds ?? 0;
        const bt = b.createdAt?.seconds ?? 0;
        return bt - at;
      });
      setServices(items);
    } catch (err) {
      console.error(err);
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // lock body scroll & close on Escape when modal is open
  useEffect(() => {
    if (selectedService) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedService(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedService]);

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Please provide both title and description.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // update existing
        const upd = { title: title.trim(), description: description.trim() };
        await updateDoc(doc(db, "services", editingId), upd);
        setServices((s) => s.map((it) => (it.id === editingId ? { ...it, ...upd } : it)));
        setEditingId(null);
        setTitle("");
        setDescription("");
      } else {
        const payload = {
          title: title.trim(),
          description: description.trim(),
          createdAt: serverTimestamp(),
        };
        const ref = await addDoc(servicesCol, payload as any);
        setServices((s) => [{ id: ref.id, ...payload } as Service, ...s]);
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save service.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(s: Service) {
    setEditingId(s.id ?? null);
    setTitle(s.title);
    setDescription(s.description);
    // scroll to top so the form is visible
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm("Delete this service?")) return;
    try {
      await deleteDoc(doc(db, "services", id));
      setServices((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete service.");
    }
  }

  return (
    <main className="min-h-screen py-10 px-6 lg:px-12 static-bg text-slate-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin — Services</h1>

        <section className="mb-8">
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Service</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-slate-100 outline-none"
                placeholder="e.g. Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-slate-100 outline-none resize-none h-28"
                placeholder="Short description of the service"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving…" : editingId ? "Update Service" : "Add Service"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingId) {
                    setEditingId(null);
                  }
                  setTitle("");
                  setDescription("");
                  setError(null);
                }}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg"
              >
                Reset
              </button>
              {error && <p className="text-sm text-rose-400">{error}</p>}
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Existing Services</h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : services.length === 0 ? (
            <p className="text-slate-400">No services yet.</p>
          ) : (
            <ul className="space-y-3">
              {services.map((s) => (
                <li
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg bg-slate-800/40 border border-white/10 hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div>
                          <div className="font-semibold text-slate-100">{s.title}</div>
                          <div className="text-sm text-slate-300">{s.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(s); }}
                            className="px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                            className="px-3 py-1 bg-rose-600 text-white rounded-md"
                          >
                            Delete
                          </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {selectedService && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-slate-900/90 border border-white/10 rounded-lg max-w-xl w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-white/6">
              <h3 className="text-lg font-semibold text-slate-100">{selectedService.title}</h3>
              <button onClick={() => setSelectedService(null)} className="text-slate-300 hover:text-slate-100">Close</button>
            </div>
            <div className="p-4 text-slate-200">
              <div className="mb-3 text-sm text-slate-400">{formatServiceDate(selectedService.createdAt)}</div>
              <div className="whitespace-pre-wrap">{selectedService.description}</div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-white/6">
              <button onClick={() => { setSelectedService(null); }} className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600">Close</button>
              <button onClick={() => { if (selectedService) { startEdit(selectedService); setSelectedService(null); } }} className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-400">Edit</button>
              <button onClick={() => { if (selectedService?.id) { handleDelete(selectedService.id); setSelectedService(null); } }} className="px-3 py-1 bg-rose-600 text-white rounded hover:bg-rose-500">Delete</button>
            </div>
          </div>
        </div>, document.body)}
    </main>
  );
}
