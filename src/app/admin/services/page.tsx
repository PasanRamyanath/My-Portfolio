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
    <div className="max-w-5xl mx-auto py-8 text-slate-100">
      <div className="bg-slate-900/70 rounded-xl shadow-lg p-8 mb-8 border border-white/10 backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">{editingId ? "Edit Service" : "Add New Service"}</h2>

        <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Service</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500"
                placeholder="e.g. Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 outline-none resize-none h-28 focus:border-blue-500"
                placeholder="Short description of the service"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:opacity-60"
              >
                {saving ? "Saving…" : editingId ? "Update Service" : "Add Service"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                    setError(null);
                  }}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {error && <div className="text-rose-400">{error}</div>}
          </form>
        </div>

        <div className="bg-slate-900/70 rounded-xl shadow p-6 border border-white/10 backdrop-blur-md">
          <h3 className="text-xl font-semibold mb-4 text-slate-100">Existing Services</h3>
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 bg-slate-800 rounded animate-pulse" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-slate-400">No services yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className="border border-white/10 rounded p-4 flex flex-col gap-3 cursor-pointer bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-100">{s.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(s); }}
                          className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-400 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                          className="px-3 py-1 bg-rose-600 text-white rounded hover:bg-rose-500 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mt-2 line-clamp-3">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      {selectedService && typeof document !== "undefined" && (createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-slate-900/80 border border-white/10 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-4">
              <button onClick={() => setSelectedService(null)} className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600">Close</button>
            </div>

            <div className="px-6 pb-8">
              <h2 className="text-2xl font-bold mb-2 text-slate-100">{selectedService.title}</h2>
              <p className="text-xs text-slate-400 mb-4">Created: {formatServiceDate(selectedService.createdAt)}</p>
              <div className="prose max-w-none text-slate-300 mb-4 whitespace-pre-wrap">{selectedService.description}</div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => { if (selectedService) { startEdit(selectedService); setSelectedService(null); } }} className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-400">Edit</button>
                <button onClick={() => { if (selectedService?.id) { handleDelete(selectedService.id); setSelectedService(null); } }} className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-500">Delete</button>
              </div>
            </div>
          </div>
        </div>, document.body))}
    </div>
  );
}
