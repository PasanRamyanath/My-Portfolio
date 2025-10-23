"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  deleteField,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

interface Project {
  id: string;
  title: string;
  description: string;
  github?: string;
  demo?: string;
  image?: string;
  // allow arbitrary media keys (media0, media1...)
  [key: string]: any;
  type?: string;
}

export default function AdminProjectsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    // media items: { url, fileId? }
    media: [] as Array<{ url: string; fileId?: string }>,
    // long description and tech stacks
    longDescription: "",
    techStacks: [] as string[],
    github: "",
    demo: "",
    type: "own",
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);

  const ADMIN_EMAIL = "pjramyanath@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoadingProjects(true);
    try {
      const snap = await getDocs(collection(db, "projects"));
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Project[];
      setProjects(data);
      const types = Array.from(new Set(data.map((p) => p.type).filter(Boolean))) as string[];
      setProjectTypes(types);
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTechKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (!val) return;
      setForm((prev: any) => ({ ...prev, techStacks: Array.from(new Set([...(prev.techStacks || []), val])) }));
      (e.target as HTMLInputElement).value = "";
    }
  };

  const handleMediaUpload = async () => {
    if (mediaFiles.length === 0) {
      setError("Please select one or more files to upload.");
      return;
    }

    setUploadingMedia(true);
    setError("");
    setSuccess("");

    try {
      const uploaded: Array<{ url: string; fileId?: string }> = [];

      for (const file of mediaFiles) {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to upload media");
        // store as object with url and fileId so we can delete later
        uploaded.push({ url: data.url, fileId: data.fileId });
      }

  setForm((prev: any) => ({ ...prev, media: [...(prev.media || []), ...uploaded] }));
      setSuccess(`Uploaded ${uploaded.length} file(s)`);
      setMediaFiles([]);
      // clear the native file input
      try { if (fileInputRef.current) fileInputRef.current.value = ""; } catch (_) {}
    } catch (err: any) {
      setError(err.message || "Media upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  const clearSelectedFiles = () => {
    setMediaFiles([]);
    try { if (fileInputRef.current) fileInputRef.current.value = ""; } catch (_) {}
  };

  // remove media at index from form (and optionally from storage/firestore)
  const removeMediaAt = async (index: number) => {
    const item = (form as any).media?.[index];
    // determine fileId if present (support string legacy or object)
    const fileId = item?.fileId ?? null;

    // if this project is already saved, update Firestore fields
    if (editingId) {
      try {
        // delete from ImageKit if we have a fileId
        if (fileId) {
          await fetch(`/api/upload/delete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileId }) });
        }

        // build remaining media array
        const remaining = (form as any).media.filter((_: any, i: number) => i !== index);

        // fetch current doc
        const docRef = doc(db, "projects", editingId);
        const snap = await getDoc(docRef);
        const current = snap.exists() ? (snap.data() as any) : {};

        // If the document already stores a `media` array, update that directly
        if (Array.isArray(current.media)) {
          const remainingUrls = remaining.map((m: any) => (typeof m === 'string' ? m : m?.url)).filter(Boolean);
          await updateDoc(docRef, { media: remainingUrls });
        } else {
          // legacy: reindex media0..mediaN fields and delete leftovers
          const existingKeys = Object.keys(current).filter((k) => /^media\d+$/.test(k));
          const updateObj: any = {};
          remaining.forEach((m: any, idx: number) => {
            updateObj[`media${idx}`] = m;
          });
          existingKeys.forEach((k) => {
            const n = parseInt(k.replace("media", ""), 10);
            if (isNaN(n)) return;
            if (n >= remaining.length) updateObj[k] = deleteField();
          });
          await updateDoc(docRef, updateObj);
        }

        // update local form and refresh projects
        setForm((prev: any) => ({ ...prev, media: remaining }));
        await fetchProjects();
        setSuccess("Media removed");
      } catch (err: any) {
        setError(err.message || "Failed to remove media");
      }
    } else {
      // not yet saved: just delete from ImageKit if possible and remove from form
      try {
        if (fileId) {
          await fetch(`/api/upload/delete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileId }) });
        }
        setForm((prev: any) => ({ ...prev, media: prev.media.filter((_: any, i: number) => i !== index) }));
        setSuccess("Media removed");
      } catch (err: any) {
        setError(err.message || "Failed to remove media");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // build payload
      const payload: any = {
        title: (form as any).title,
        description: (form as any).description,
        github: (form as any).github,
        demo: (form as any).demo,
        type: (form as any).type,
      };

      // attach long-description and tech-stacks using hyphenated keys
      if ((form as any).longDescription) payload["long-description"] = (form as any).longDescription;
      if (Array.isArray((form as any).techStacks)) payload["tech-stacks"] = (form as any).techStacks.filter(Boolean);

      // attach media as a single array of URL strings (preferred format)
      if (Array.isArray((form as any).media)) {
        payload.media = (form as any).media.map((m: any) => (typeof m === 'string' ? m : m?.url)).filter(Boolean);
      }

      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), payload);
        setSuccess("Project updated successfully!");
      } else {
        await addDoc(collection(db, "projects"), payload);
        setSuccess("Project added successfully!");
      }

    setForm({ title: "", description: "", media: [], longDescription: "", techStacks: [], github: "", demo: "", type: "own" });
      setMediaFiles([]);
      setEditingId(null);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || "Error saving project");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
    setEditingId(p.id);
    // extract mediaN fields if present
    const mediaKeys = Object.keys(p).filter((k) => k.startsWith("media")).sort((a, b) => {
      const na = parseInt(a.replace("media", ""));
      const nb = parseInt(b.replace("media", ""));
      return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
    });
    const mediaValues = mediaKeys.map((k) => p[k]).filter(Boolean);

    // prefer new `media` array if present, otherwise fall back to legacy mediaN fields or image
    let normalizedMedia: Array<{ url: string; fileId?: string }> = [];
    if (Array.isArray((p as any).media) && (p as any).media.length > 0) {
      normalizedMedia = (p as any).media.map((v: any) => (typeof v === 'string' ? { url: v } : v));
    } else {
      const mediaKeys2 = Object.keys(p).filter((k) => k.startsWith("media")).sort((a, b) => {
        const na = parseInt(a.replace("media", ""));
        const nb = parseInt(b.replace("media", ""));
        return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
      });
      const mediaValues2 = mediaKeys2.map((k) => p[k]).filter(Boolean);
      normalizedMedia = mediaValues2.length > 0
        ? mediaValues2.map((v: any) => (typeof v === 'string' ? { url: v } : v))
        : p.image ? [typeof p.image === 'string' ? { url: p.image } : p.image] : [];
    }

    setForm({
      title: p.title || "",
      description: p.description || "",
      media: normalizedMedia,
      longDescription: (p as any)["long-description"] ?? (p as any).longDescription ?? "",
      techStacks: (p as any)["tech-stacks"] ?? (p as any).techStacks ?? [],
      github: p.github || "",
      demo: p.demo || "",
      type: p.type || "own",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      // fetch doc to gather media fileIds and delete them from ImageKit
      const docRef = doc(db, "projects", id);
      const snap = await getDoc(docRef);
      const data = snap.exists() ? (snap.data() as any) : {};

      // collect media fields (media0..mediaN)
      const mediaKeys = Object.keys(data).filter((k) => /^media\d+$/.test(k)).sort((a, b) => {
        const na = parseInt(a.replace("media", ""), 10);
        const nb = parseInt(b.replace("media", ""), 10);
        return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
      });

      // helper to extract fileId if present
      const extractFileId = (val: any) => (val && typeof val === 'object' ? val.fileId : null);

      const fileIds: string[] = [];
      mediaKeys.forEach((k) => {
        const v = data[k];
        const fid = extractFileId(v);
        if (fid) fileIds.push(fid);
      });

      // legacy single image field might be an object {url, fileId}
      if (data.image && typeof data.image === 'object' && data.image.fileId) fileIds.push(data.image.fileId);

      // call delete API for each fileId
      for (const fid of fileIds) {
        try {
          await fetch(`/api/upload/delete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileId: fid }) });
        } catch (err) {
          console.warn("Failed to delete remote file", fid, err);
        }
      }

      // finally delete the Firestore document
      await deleteDoc(docRef);
      setSuccess("Project deleted");
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    }
  };

  // Lock body scroll when modal open and handle Escape
  useEffect(() => {
    if (selectedProject) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  // reset selected media index when project changes
  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [selectedProject]);

  const getMediaFromProject = (p: Project) => {
    if (!p) return [] as string[];
    // prefer media array if present
    if ((p as any).media && Array.isArray((p as any).media) && (p as any).media.length > 0) {
      return (p as any).media.map((v: any) => (typeof v === 'string' ? v : v?.url)).filter(Boolean) as string[];
    }
    // collect keys like media0, media1, ... in order (legacy)
    const keys = Object.keys(p).filter((k) => /^media\d+$/.test(k)).sort((a, b) => {
      const na = parseInt(a.replace("media", ""), 10);
      const nb = parseInt(b.replace("media", ""), 10);
      return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
    });
    const values = keys.map((k) => p[k]).filter(Boolean) as any[];
    const urls = values.map((v) => (typeof v === 'string' ? v : v?.url)).filter(Boolean) as string[];
    if (urls.length > 0) return urls;
    if ((p as any).image) return [typeof (p as any).image === 'string' ? (p as any).image : (p as any).image?.url];
    return [] as string[];
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
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Project" : "Add New Project"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border px-4 py-2 rounded"
            required
          />

          {/* Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project type</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full border px-4 py-2 rounded">
              <option value="own">own</option>
              <option value="private">private</option>
              <option value="group">group</option>
            </select>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border px-4 py-2 rounded"
            required
          />

          {/* Long Description (multi-paragraph) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
            <textarea
              name="longDescription"
              value={(form as any).longDescription}
              onChange={handleChange}
              placeholder="Long description / full details"
              className="w-full border px-4 py-2 rounded h-32"
            />
          </div>

          {/* Tech stacks input as tags (press Enter to add) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stacks</label>
            <input
              type="text"
              placeholder="Type a tech and press Enter"
              onKeyDown={handleTechKey}
              className="w-full border px-4 py-2 rounded"
            />
            <div className="flex gap-2 flex-wrap mt-2">
              {(form as any).techStacks?.map((t: string, idx: number) => (
                <span key={t + idx} className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                  {t}
                  <button type="button" onClick={() => setForm((prev: any) => ({ ...prev, techStacks: prev.techStacks.filter((s: string, i: number) => i !== idx) }))} className="text-xs px-1">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* Media Upload Section (supports multiple images/videos) */}
          <div className="space-y-2">
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} />
            <div className="flex gap-2 items-center">
              <button type="button" onClick={handleMediaUpload} disabled={mediaFiles.length === 0 || uploadingMedia} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                {uploadingMedia ? "Uploading..." : `Upload ${mediaFiles.length > 0 ? mediaFiles.length : "file(s)"}`}
              </button>
              <button type="button" onClick={clearSelectedFiles} disabled={mediaFiles.length === 0 && !fileInputRef.current?.value} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Clear
              </button>
              <div className="flex gap-2 flex-wrap">
                {(form as any).media && (form as any).media.map((m: any, i: number) => {
                  const url = typeof m === "string" ? m : m?.url;
                  return (
                  <div key={url} className="mt-2 relative w-36 h-24 bg-gray-100 rounded overflow-hidden">
                    {url?.endsWith?.('.mp4') || url?.endsWith?.('.webm') ? (
                      <video src={url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={url} alt={`media-${i}`} className="w-full h-full object-cover" />
                    )}
                    <button type="button" onClick={() => removeMediaAt(i)} className="absolute top-1 right-1 bg-black/60 text-white px-2 py-0.5 rounded">Remove</button>
                  </div>
                );
                })}
              </div>
            </div>
          </div>

          <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub URL" className="w-full border px-4 py-2 rounded" />

          <input name="demo" value={form.demo} onChange={handleChange} placeholder="Live Demo URL" className="w-full border px-4 py-2 rounded" />

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Project" : "Add Project"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", description: "", media: [], github: "", demo: "", type: "own", longDescription: "", techStacks: [] }); }} className="px-4 py-2 bg-gray-200 rounded">
                Cancel Edit
              </button>
            )}
          </div>

          {success && <div className="text-green-600">{success}</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Existing Projects</h3>
            
        {projectTypes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedType === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                All
              </button>
              {projectTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${selectedType === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingProjects ? (
          <div>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div>No projects yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(selectedType === "all" ? projects : projects.filter((p) => p.type === selectedType)).map((p) => (
              <div key={p.id} className="border rounded p-4 flex gap-4 items-start cursor-pointer" onClick={() => setSelectedProject(p)}>
                {(() => {
                  const media = getMediaFromProject(p);
                  if (media.length > 0) {
                    const m = media[0];
                    return m.endsWith('.mp4') || m.endsWith('.webm') ? (
                      <video src={m} className="w-24 h-16 object-cover rounded" />
                    ) : (
                      <img src={m} alt={p.title} className="w-24 h-16 object-cover rounded" />
                    );
                  }
                  return null;
                })()}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{p.title}</h4>
                      <p className="text-sm text-gray-600">{p.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="px-3 py-1 bg-yellow-400 text-white rounded">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedProject &&
        (typeof document !== "undefined"
          ? createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedProject(null)}>
                <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end p-4">
                    <button onClick={() => setSelectedProject(null)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Close</button>
                  </div>

                  <div className="px-6 pb-8">
                    {/* Selected media gallery */}
                    {(() => {
                      const media = getMediaFromProject(selectedProject as Project);
                      if (media.length === 0) return null;
                      const selectedUrl = media[selectedMediaIndex] || media[0];
                      return (
                        <div>
                          <div className="w-full mb-4 relative flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedMediaIndex((i) => (i - 1 + media.length) % media.length); }}
                              className="absolute left-2 z-10 bg-white/80 rounded-full p-2"
                              aria-label="Previous media"
                            >
                              ◀
                            </button>

                            {selectedUrl.endsWith('.mp4') || selectedUrl.endsWith('.webm') ? (
                              <video src={selectedUrl} className="w-full max-w-full max-h-[60vh] object-contain rounded" controls />
                            ) : (
                              <img src={selectedUrl} alt={selectedProject?.title} className="w-full max-w-full max-h-[60vh] object-contain rounded" />
                            )}

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedMediaIndex((i) => (i + 1) % media.length); }}
                              className="absolute right-2 z-10 bg-white/80 rounded-full p-2"
                              aria-label="Next media"
                            >
                              ▶
                            </button>
                          </div>

                          <div className="flex gap-2 mb-4 overflow-x-auto">
                            {media.map((m, idx) => (
                              <button key={m} onClick={() => setSelectedMediaIndex(idx)} className={`w-20 h-14 rounded overflow-hidden border ${idx === selectedMediaIndex ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}>
                                {m.endsWith('.mp4') || m.endsWith('.webm') ? (
                                  <video src={m} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={m} className="w-full h-full object-cover" />
                                )}
                              </button>
                            ))}
                          </div>

                          <h2 className="text-2xl font-bold mb-2">{selectedProject.title}</h2>
                        </div>
                      );
                    })()}
                    <p className="text-sm text-gray-500 mb-4">Type: {selectedProject.type}</p>
                    <div className="prose max-w-none text-gray-700 mb-4">{selectedProject.description}</div>

                    {/* Long description and tech stacks */}
                    {((selectedProject as any)["long-description"] || (selectedProject as any).longDescription) && (
                      <div className="mb-4">
                        <h4 className="font-semibold">Details</h4>
                        <div className="text-gray-700">{(selectedProject as any)["long-description"] ?? (selectedProject as any).longDescription}</div>
                      </div>
                    )}

                    {(((selectedProject as any)["tech-stacks"] && Array.isArray((selectedProject as any)["tech-stacks"])) || ((selectedProject as any).techStacks && Array.isArray((selectedProject as any).techStacks))) && (
                      <div className="mb-4">
                        <h4 className="font-semibold">Tech Stacks</h4>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {(((selectedProject as any)["tech-stacks"]) || (selectedProject as any).techStacks).map((t: string, i: number) => (
                            <span key={t + i} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      {selectedProject.github && (
                        <a href={selectedProject.github} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">GitHub</a>
                      )}
                      {selectedProject.demo && (
                        <a href={selectedProject.demo} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Live Demo</a>
                      )}
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