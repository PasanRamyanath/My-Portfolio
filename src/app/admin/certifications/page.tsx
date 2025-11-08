"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, DocumentData } from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import ConfirmModal from "@/app/admin/components/ConfirmModal";

interface Cert {
  id: string;
  cert_name?: string;
  description?: string;
  image?: string;
  issuer?: string;
  linkedin?: string;
  // new: category/type of certificate
  type?: "university" | "external";
  image_file_id?: string;
}

export default function AdminCertsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [certs, setCerts] = useState<Cert[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  const [form, setForm] = useState<Omit<Cert, "id">>({ cert_name: "", description: "", image: "", issuer: "", linkedin: "", type: "university", image_file_id: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFileId, setImageFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCert, setSelectedCert] = useState<Cert | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "university" | "external">("all");

  const ADMIN_EMAIL = "pjramyanath@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadCerts();
  }, []);

  async function loadCerts() {
    setLoadingCerts(true);
    try {
      const snap = await getDocs(collection(db, "certifications"));
      const data: Cert[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }));
      setCerts(data);
    } catch (err) {
      console.error("Failed to load certs:", err);
      setError((err as Error).message);
    } finally {
      setLoadingCerts(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setError("Select an image first");
      return;
    }
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json()) as { success: boolean; url?: string; fileId?: string; error?: string };
      if (!data.success) throw new Error(data.error || "Upload failed");
  setForm((p) => ({ ...p, image: data.url ?? "", image_file_id: data.fileId ?? "" }));
  if (data.fileId) setImageFileId(data.fileId);
  // clear selected file input so same file can be reselected later
  setImageFile(null);
  if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeUploadedImage = async () => {
    // delete from ImageKit if we have fileId, then clear preview and state
    setError(null);
    setUploadingImage(true);
    try {
      if (imageFileId) {
        const resDel = await fetch("/api/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: imageFileId }),
        });
        const jd = await resDel.json();
        if (!jd.success) throw new Error(jd.error || "Failed to delete image");
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
      setError((err as Error).message || "Failed to delete image");
    } finally {
      // clear local preview regardless
      setForm((p) => ({ ...p, image: "", image_file_id: "" }));
      setImageFileId(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateDoc(doc(db, "certifications", editingId), form);
      } else {
        await addDoc(collection(db, "certifications"), form);
      }
  setForm({ cert_name: "", description: "", image: "", issuer: "", linkedin: "", type: "university", image_file_id: "" });
  setImageFileId(null);
      setEditingId(null);
      await loadCerts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: Cert) => {
    setEditingId(c.id);
    setForm({ cert_name: c.cert_name ?? "", description: c.description ?? "", image: c.image ?? "", issuer: c.issuer ?? "", linkedin: c.linkedin ?? "", type: c.type ?? "university", image_file_id: c.image_file_id ?? "" });
    setImageFileId(c.image_file_id ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      // try to delete the remote image if present
      const cert = certs.find((c) => c.id === id);
      if (cert && (cert as any).image_file_id) {
        try {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: (cert as any).image_file_id }),
          });
        } catch (err) {
          console.warn("Failed to delete remote image for cert", id, err);
        }
      }

      await deleteDoc(doc(db, "certifications", id));
      await loadCerts();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleLogout = async () => {
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

  // Body scroll lock and Escape handler for modal
  useEffect(() => {
    if (selectedCert) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCert(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedCert]);

  if (loadingUser) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="space-y-3 w-64">
        <div className="h-4 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );

  if (user?.email !== ADMIN_EMAIL) {
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
    <div className="max-w-5xl mx-auto py-8 text-slate-100">
      <div className="bg-slate-900/70 rounded-xl shadow p-6 mb-6 border border-white/10 backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">{editingId ? "Edit Certificate" : "Add Certificate"}</h2>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input name="cert_name" value={form.cert_name} onChange={handleChange} placeholder="Certificate name" className="col-span-2 w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100 placeholder-slate-400" />
            <select name="type" value={form.type} onChange={handleChange} className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100">
              <option value="university">University</option>
              <option value="external">External</option>
            </select>
          </div>

          <input name="issuer" value={form.issuer} onChange={handleChange} placeholder="Issuer" className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100 placeholder-slate-400" />
          <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100 placeholder-slate-400" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full bg-slate-800/60 border border-white/10 px-3 py-2 rounded text-slate-100 placeholder-slate-400" />

          <div className="flex gap-3 items-center">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            <button onClick={handleUpload} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500" disabled={uploadingImage}>
              {uploadingImage ? "Uploading..." : "Upload image"}
            </button>
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={!imageFile}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Clear
            </button>
            {form.image && (
              <div className="mt-2 relative w-32 h-20">
                <Image src={form.image} alt="preview" fill className="object-cover rounded" />
                <button
                  type="button"
                  aria-label="Remove uploaded image"
                  onClick={removeUploadedImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:opacity-60" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({ cert_name: "", description: "", image: "", issuer: "", linkedin: "", type: "university" });
                }}
                className="px-3 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
              >
                Cancel
              </button>
            )}
          </div>

          {error && <div className="text-rose-400">{error}</div>}
        </div>
      </div>

      <div className="bg-slate-900/70 rounded-xl shadow p-6 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-100">Certificates</h3>
          <div className="flex gap-2">
            <button onClick={() => setFilterType("all")} className={`px-3 py-1 rounded-full text-xs ${filterType === "all" ? "bg-indigo-600 text-white" : "bg-slate-800/60 text-slate-300 border border-white/10"}`}>All</button>
            <button onClick={() => setFilterType("university")} className={`px-3 py-1 rounded-full text-xs ${filterType === "university" ? "bg-indigo-600 text-white" : "bg-slate-800/60 text-slate-300 border border-white/10"}`}>University</button>
            <button onClick={() => setFilterType("external")} className={`px-3 py-1 rounded-full text-xs ${filterType === "external" ? "bg-indigo-600 text-white" : "bg-slate-800/60 text-slate-300 border border-white/10"}`}>External</button>
          </div>
        </div>

        {loadingCerts ? (
          <div className="space-y-3">
            <div className="h-4 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 bg-slate-800 rounded animate-pulse" />
          </div>
        ) : certs.length === 0 ? (
          <div className="text-slate-400">No certificates yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certs
              .filter(c => filterType === "all" ? true : c.type === filterType)
              .sort((a, b) => {
                const ta = a.type ?? "university";
                const tb = b.type ?? "university";
                if (ta === tb) return 0;
                if (ta === "external") return -1;
                if (tb === "external") return 1;
                return 0;
              })
              .map((c) => (
              <div key={c.id} className="border border-white/10 rounded p-3 flex gap-3 items-start cursor-pointer bg-slate-800/40 hover:bg-slate-800/60 transition-colors" onClick={() => setSelectedCert(c)}>
                {c.image && (
                  <div className="w-28 h-20 relative">
                    <Image src={c.image} alt={c.cert_name ?? ""} fill className="object-cover rounded" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-slate-100">{c.cert_name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-300 border border-white/6">{(c.type ?? "university").charAt(0).toUpperCase() + (c.type ?? "university").slice(1)}</span>
                      </div>
                      <p className="text-sm text-slate-400">{c.issuer}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(c);
                        }}
                        className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c.id);
                        }}
                        className="px-3 py-1 bg-rose-600 text-white rounded hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-2 line-clamp-3">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCert &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedCert(null)}>
            <div className="bg-slate-900/80 border border-white/10 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end p-4">
                <button onClick={() => setSelectedCert(null)} className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600">Close</button>
              </div>
              <div className="px-6 pb-8">
                {selectedCert.image && (
                  <div className="w-full mb-6 flex justify-center relative h-[60vh]">
                    <Image src={selectedCert.image} alt={selectedCert.cert_name ?? ""} fill className="object-contain rounded" />
                  </div>
                )}
                <h2 className="text-2xl font-bold mb-2 text-slate-100">{selectedCert.cert_name}</h2>
                {selectedCert.issuer && <p className="text-sm text-slate-400 mb-2">Issuer: {selectedCert.issuer}</p>}
                {selectedCert.linkedin && (
                  <p className="mb-4">
                    <a href={selectedCert.linkedin} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">View on LinkedIn</a>
                  </p>
                )}
                <div className="prose max-w-none text-slate-300 mb-4">{selectedCert.description}</div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setSelectedCert(null);
                      handleEdit(selectedCert);
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCert(null);
                      handleDelete(selectedCert.id);
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
