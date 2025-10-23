"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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
  type?: string;
  longDescription?: string;
  techStacks?: string[];
}

interface ProjectForm {
  title: string;
  description: string;
  media: MediaItem[];
  longDescription: string;
  techStacks: string[];
  github: string;
  demo: string;
  type: string;
}

export default function AdminProjectsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);

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

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const snap = await getDocs(collection(db, "projects"));
      const data = snap.docs.map((d) => ({ ...(d.data() as Omit<Project, "id">), id: d.id }));
      setProjects(data);
      const types = Array.from(new Set(data.map((p) => p.type).filter((t): t is string => typeof t === "string")));
      setProjectTypes(types);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = (e.target as HTMLInputElement).value.trim();
    if (!val) return;
    setForm((prev) => ({ ...prev, techStacks: Array.from(new Set([...prev.techStacks, val])) }));
    (e.target as HTMLInputElement).value = "";
  };

  const handleMediaUpload = async () => {
    if (!mediaFiles.length) {
      setError("Please select files");
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
        if (!data.success) throw new Error(data.error || "Upload failed");
        uploaded.push({ url: data.url, fileId: data.fileId });
      }
      setForm((prev) => ({ ...prev, media: [...prev.media, ...uploaded] }));
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess(`Uploaded ${uploaded.length} file(s)`);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMediaAt = async (index: number) => {
    const item = form.media[index];
    const fileId = item?.fileId;

    if (editingId) {
      try {
        if (fileId) await fetch(`/api/upload/delete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileId }) });
        const remaining = form.media.filter((_, i) => i !== index);
        const docRef = doc(db, "projects", editingId);
        await updateDoc(docRef, { media: remaining.map((m) => m.url) });
        setForm((prev) => ({ ...prev, media: remaining }));
        await fetchProjects();
        setSuccess("Media removed");
      } catch (err: any) {
        setError(err.message || "Failed to remove media");
      }
    } else {
      setForm((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        github: form.github,
        demo: form.demo,
        type: form.type,
        longDescription: form.longDescription,
        techStacks: form.techStacks,
        media: form.media,
      };

      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), payload);
        setSuccess("Project updated");
      } else {
        await addDoc(collection(db, "projects"), payload);
        setSuccess("Project added");
      }
      setForm({ title: "", description: "", media: [], longDescription: "", techStacks: [], github: "", demo: "", type: "own" });
      setMediaFiles([]);
      setEditingId(null);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      media: p.media || [],
      longDescription: p.longDescription || "",
      techStacks: p.techStacks || [],
      github: p.github || "",
      demo: p.demo || "",
      type: p.type || "own",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loadingUser) return <p>Loading...</p>;
  if (userEmail !== ADMIN_EMAIL)
    return (
      <div className="text-center mt-20 text-red-500">
        Access Denied
        <button onClick={handleLogout}>Logout</button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Project" : "Add New Project"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border px-4 py-2 rounded" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border px-4 py-2 rounded" required />
          <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub URL" className="w-full border px-4 py-2 rounded" />
          <input name="demo" value={form.demo} onChange={handleChange} placeholder="Live Demo URL" className="w-full border px-4 py-2 rounded" />
          <button type="submit">{loading ? "Saving..." : editingId ? "Update Project" : "Add Project"}</button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="border p-4 flex gap-4" onClick={() => handleEdit(p)}>
            {p.media && p.media[0] && (
              p.media[0].url.endsWith(".mp4") ? (
                <video src={p.media[0].url} className="w-24 h-16 object-cover" />
              ) : (
                <Image src={p.media[0].url} width={96} height={64} alt={p.title} className="object-cover rounded" />
              )
            )}
            <div>{p.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
