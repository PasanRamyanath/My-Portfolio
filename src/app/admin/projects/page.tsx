"use client";

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
  [key: string]: any;
  type?: string;
}

export default function AdminProjectsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    media: [] as Array<{ url: string; fileId?: string }>,
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
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      setError("Please select files to upload.");
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
        uploaded.push({ url: data.url, fileId: data.fileId });
      }

      setForm((prev: any) => ({ ...prev, media: [...(prev.media || []), ...uploaded] }));
      setSuccess(`Uploaded ${uploaded.length} file(s)`);
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Media upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  const clearSelectedFiles = () => {
    setMediaFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMediaAt = async (index: number) => {
    const item = form.media?.[index];
    const fileId = item?.fileId ?? null;

    if (editingId) {
      try {
        if (fileId) {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ fileId }),
          });
        }
        const remaining = form.media.filter((_: any, i: number) => i !== index);
        const docRef = doc(db, "projects", editingId);
        const snap = await getDoc(docRef);
        const current = snap.exists() ? (snap.data() as any) : {};
        if (Array.isArray(current.media)) {
          await updateDoc(docRef, { media: remaining.map((m) => (typeof m === "string" ? m : m?.url)) });
        } else {
          const keys = Object.keys(current).filter((k) => /^media\d+$/.test(k));
          const updateObj: any = {};
          remaining.forEach((m, i) => (updateObj[`media${i}`] = m));
          keys.forEach((k, i) => { if (i >= remaining.length) updateObj[k] = deleteField(); });
          await updateDoc(docRef, updateObj);
        }
        setForm((prev: any) => ({ ...prev, media: remaining }));
        await fetchProjects();
        setSuccess("Media removed");
      } catch (err: any) {
        setError(err.message || "Failed to remove media");
      }
    } else {
      try {
        if (fileId) {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ fileId }),
          });
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
      const payload: any = {
        title: form.title,
        description: form.description,
        github: form.github,
        demo: form.demo,
        type: form.type,
      };
      if (form.longDescription) payload["long-description"] = form.longDescription;
      if (form.techStacks.length) payload["tech-stacks"] = form.techStacks.filter(Boolean);
      if (form.media.length) payload.media = form.media.map((m) => (typeof m === "string" ? m : m.url)).filter(Boolean);

      if (editingId) await updateDoc(doc(db, "projects", editingId), payload);
      else await addDoc(collection(db, "projects"), payload);

      setForm({ title: "", description: "", media: [], longDescription: "", techStacks: [], github: "", demo: "", type: "own" });
      setMediaFiles([]);
      setEditingId(null);
      await fetchProjects();
      setSuccess(editingId ? "Project updated" : "Project added");
    } catch (err: any) {
      setError(err.message || "Error saving project");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
    const normalizedMedia = Array.isArray(p.media) && p.media.length > 0
      ? p.media.map((v: any) => (typeof v === "string" ? { url: v } : v))
      : p.image ? [typeof p.image === "string" ? { url: p.image } : p.image] : [];
    setForm({
      title: p.title || "",
      description: p.description || "",
      media: normalizedMedia,
      longDescription: p["long-description"] ?? p.longDescription ?? "",
      techStacks: p["tech-stacks"] ?? p.techStacks ?? [],
      github: p.github || "",
      demo: p.demo || "",
      type: p.type || "own",
    });
    setEditingId(p.id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const docRef = doc(db, "projects", id);
      const snap = await getDoc(docRef);
      const data = snap.exists() ? (snap.data() as any) : {};
      const mediaItems: any[] = [];

      if (Array.isArray(data.media)) mediaItems.push(...data.media);
      else Object.keys(data).filter((k) => /^media\d+$/.test(k)).forEach((k) => mediaItems.push(data[k]));
      if (data.image) mediaItems.push(data.image);

      for (const item of mediaItems) {
        if (item?.fileId) {
          await fetch("/api/upload/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileId: item.fileId }) });
        }
      }

      await deleteDoc(docRef);
      setSuccess("Project deleted");
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    }
  };

  const handleLogout = async () => await signOut(auth);

  if (loadingUser) return <p>Loading...</p>;
  if (userEmail !== ADMIN_EMAIL)
    return (
      <div className="text-center mt-20 text-red-500">
        Access Denied. You are not authorized.
        <div className="mt-4">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Logout
          </button>
        </div>
      </div>
    );

  const getMediaFromProject = (p: Project) => {
    if (!p) return [];
    if (Array.isArray(p.media) && p.media.length > 0) return p.media.map((v) => (typeof v === "string" ? v : v?.url)).filter(Boolean);
    if (p.image) return [typeof p.image === "string" ? p.image : (p.image as any)?.url];
    return [];
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* ... keep all form and project listing JSX unchanged ... */}

      {typeof window !== "undefined" && selectedProject &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedProject(null)}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
              {/* modal content ... same as before ... */}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
