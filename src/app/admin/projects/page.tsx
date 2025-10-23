"use client";

import React, { useEffect, useState, useRef, ChangeEvent, KeyboardEvent, FormEvent } from "react";
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
  DocumentData,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

interface MediaItem {
  url: string;
  fileId?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  github?: string;
  demo?: string;
  image?: string;
  media?: MediaItem[];
  "long-description"?: string;
  "tech-stacks"?: string[];
  type?: "own" | "private" | "group" | string;
  [key: string]: unknown;
}

interface ProjectForm {
  title: string;
  description: string;
  media: MediaItem[];
  longDescription: string;
  techStacks: string[];
  github: string;
  demo: string;
  type: "own" | "private" | "group";
}

export default function AdminProjectsPage() {
  const ADMIN_EMAIL = "pjramyanath@gmail.com";

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("all");

  const [form, setForm] = useState<ProjectForm>({
    title: "",
    description: "",
    media: [],
    longDescription: "",
    techStacks: [],
    github: "",
    demo: "",
    type: "own",
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      const data: Project[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Project[];
      setProjects(data);
      const types = Array.from(new Set(data.map((p) => p.type).filter(Boolean))) as string[];
      setProjectTypes(types);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (!val) return;
      setForm((prev) => ({
        ...prev,
        techStacks: Array.from(new Set([...prev.techStacks, val])),
      }));
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
      const uploaded: MediaItem[] = [];
      for (const file of mediaFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to upload media");
        uploaded.push({ url: data.url, fileId: data.fileId });
      }
      setForm((prev) => ({ ...prev, media: [...prev.media, ...uploaded] }));
      setSuccess(`Uploaded ${uploaded.length} file(s)`);
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError((err as Error).message || "Media upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMediaAt = async (index: number) => {
    const item = form.media[index];
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

        const remaining = form.media.filter((_, i) => i !== index);
        const docRef = doc(db, "projects", editingId);
        const snap = await getDoc(docRef);
        const current = snap.exists() ? (snap.data() as DocumentData) : {};

        if (Array.isArray(current.media)) {
          await updateDoc(docRef, { media: remaining.map((m) => m.url) });
        } else {
          const keys = Object.keys(current).filter((k) => /^media\d+$/.test(k));
          const updateObj: Record<string, unknown> = {};
          remaining.forEach((m, i) => (updateObj[`media${i}`] = m));
          keys.forEach((k, i) => { if (i >= remaining.length) updateObj[k] = deleteField(); });
          await updateDoc(docRef, updateObj);
        }

        setForm((prev) => ({ ...prev, media: remaining }));
        await fetchProjects();
        setSuccess("Media removed");
      } catch (err) {
        setError((err as Error).message || "Failed to remove media");
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
        setForm((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
        setSuccess("Media removed");
      } catch (err) {
        setError((err as Error).message || "Failed to remove media");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        github: form.github,
        demo: form.demo,
        type: form.type,
      };
      if (form.longDescription) payload["long-description"] = form.longDescription;
      if (form.techStacks.length) payload["tech-stacks"] = form.techStacks.filter(Boolean);
      if (form.media.length) payload.media = form.media.map((m) => m.url).filter(Boolean);

      if (editingId) await updateDoc(doc(db, "projects", editingId), payload);
      else await addDoc(collection(db, "projects"), payload);

      setForm({ title: "", description: "", media: [], longDescription: "", techStacks: [], github: "", demo: "", type: "own" });
      setMediaFiles([]);
      setEditingId(null);
      await fetchProjects();
      setSuccess(editingId ? "Project updated" : "Project added");
    } catch (err) {
      setError((err as Error).message || "Error saving project");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
    const normalizedMedia: MediaItem[] = Array.isArray(p.media) && p.media.length > 0
      ? p.media.map((v) => (typeof v === "string" ? { url: v } : v as MediaItem))
      : p.image ? [{ url: typeof p.image === "string" ? p.image : (p.image as MediaItem).url }] : [];

    setForm({
      title: p.title || "",
      description: p.description || "",
      media: normalizedMedia,
      longDescription: p["long-description"] ?? "",
      techStacks: p["tech-stacks"] ?? [],
      github: p.github || "",
      demo: p.demo || "",
      type: (p.type as "own" | "private" | "group") || "own",
    });
    setEditingId(p.id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const docRef = doc(db, "projects", id);
      const snap = await getDoc(docRef);
      const data = snap.exists() ? (snap.data() as DocumentData) : {};
      const mediaItems: MediaItem[] = [];

      if (Array.isArray(data.media)) mediaItems.push(...data.media as MediaItem[]);
      else Object.keys(data).filter((k) => /^media\d+$/.test(k)).forEach((k) => mediaItems.push(data[k] as MediaItem));
      if (data.image) mediaItems.push(typeof data.image === "string" ? { url: data.image } : data.image as MediaItem);

      for (const item of mediaItems) {
        if (item?.fileId) {
          await fetch("/api/upload/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileId: item.fileId }) });
        }
      }

      await deleteDoc(docRef);
      setSuccess("Project deleted");
      await fetchProjects();
    } catch (err) {
      setError((err as Error).message || "Failed to delete project");
    }
  };

  const handleLogout = async () => await signOut(auth);

  const getMediaFromProject = (p: Project) => {
    if (!p) return [];
    if (Array.isArray(p.media) && p.media.length > 0) return p.media.map((v) => v.url).filter(Boolean);
    if (p.image) return [typeof p.image === "string" ? p.image : (p.image as MediaItem).url];
    return [];
  };

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

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Keep all form and project listing JSX unchanged */}

      {typeof window !== "undefined" && selectedProject &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedProject(null)}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
              {/* modal content ... */}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
