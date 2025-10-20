"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface Cert {
  id: string;
  cert_name?: string;
  description?: string;
  image?: string;
  issuer?: string;
  linkedin?: string;
}

export default function AdminCertsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [certs, setCerts] = useState<Cert[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  const [form, setForm] = useState({ cert_name: "", description: "", image: "", issuer: "", linkedin: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Cert | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ADMIN_EMAIL = "pjramyanath@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserEmail(u?.email ?? null);
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
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Cert[];
      setCerts(data);
    } catch (err: any) {
      console.error("Failed to load certs:", err);
    } finally {
      setLoadingCerts(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      setForm((p) => ({ ...p, image: data.url }));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
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
      setForm({ cert_name: "", description: "", image: "", issuer: "", linkedin: "" });
      setEditingId(null);
      await loadCerts();
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: Cert) => {
    setEditingId(c.id);
    setForm({ cert_name: c.cert_name ?? "", description: c.description ?? "", image: c.image ?? "", issuer: c.issuer ?? "", linkedin: c.linkedin ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      await deleteDoc(doc(db, "certifications", id));
      await loadCerts();
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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

  if (loadingUser) return <p>Loading...</p>;

  if (userEmail !== ADMIN_EMAIL) {
    return (
      <div className="text-center mt-20 text-red-500">
        Access Denied.
        <div className="mt-4">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Certificate" : "Add Certificate"}</h2>

        <div className="space-y-3">
          <input name="cert_name" value={form.cert_name} onChange={handleChange} placeholder="Certificate name" className="w-full border px-3 py-2 rounded" />
          <input name="issuer" value={form.issuer} onChange={handleChange} placeholder="Issuer" className="w-full border px-3 py-2 rounded" />
          <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full border px-3 py-2 rounded" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border px-3 py-2 rounded" />

          <div className="flex gap-3 items-center">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            <button onClick={handleUpload} className="px-3 py-2 bg-blue-600 text-white rounded" disabled={uploadingImage}>{uploadingImage ? "Uploading..." : "Upload image"}</button>
            {form.image && <img src={form.image} alt="preview" className="w-32 h-20 object-cover rounded" />}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : (editingId ? "Update" : "Add")}</button>
            {editingId && <button onClick={() => { setEditingId(null); setForm({ cert_name: "", description: "", image: "", issuer: "", linkedin: "" }); }} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>}
          </div>

          {error && <div className="text-red-600">{error}</div>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Certificates</h3>

        {loadingCerts ? (
          <div>Loading...</div>
        ) : certs.length === 0 ? (
          <div>No certificates yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certs.map((c) => (
              <div key={c.id} className="border rounded p-3 flex gap-3 items-start cursor-pointer" onClick={() => setSelectedCert(c)}>
                {c.image && <img src={c.image} alt={c.cert_name} className="w-28 h-20 object-cover rounded" />}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{c.cert_name}</h4>
                      <p className="text-sm text-gray-600">{c.issuer}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(c); }} className="px-3 py-1 bg-yellow-400 text-white rounded">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedCert &&
        (typeof document !== "undefined"
          ? createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedCert(null)}>
                <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end p-4">
                    <button onClick={() => setSelectedCert(null)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Close</button>
                  </div>

                  <div className="px-6 pb-8">
                    {selectedCert.image && (
                      <div className="w-full mb-6 flex justify-center">
                        <img src={selectedCert.image} alt={selectedCert.cert_name} className="w-full max-w-full max-h-[60vh] object-contain rounded" />
                      </div>
                    )}

                    <h2 className="text-2xl font-bold mb-2">{selectedCert.cert_name}</h2>
                    {selectedCert.issuer && <p className="text-sm text-gray-500 mb-2">Issuer: {selectedCert.issuer}</p>}
                    {selectedCert.linkedin && (
                      <p className="mb-4"><a href={selectedCert.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600">View on LinkedIn</a></p>
                    )}

                    <div className="prose max-w-none text-gray-700 mb-4">{selectedCert.description}</div>

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => { setSelectedCert(null); handleEdit(selectedCert); }} className="px-4 py-2 bg-yellow-400 text-white rounded">Edit</button>
                      <button onClick={() => { setSelectedCert(null); handleDelete(selectedCert.id); }} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null)}
    </div>
  );
}
