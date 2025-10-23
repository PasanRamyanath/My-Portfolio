"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
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

const ADMIN_EMAIL = "pjramyanath@gmail.com";

export default function AdminProjectsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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
        setSuccess("Project updated successfully");
      } else {
        await addDoc(collection(db, "projects"), payload);
        setSuccess("Project added successfully");
      }

      setForm({ title: "", description: "", media: [], longDescription: "", techStacks: [], github: "", demo: "", type: "own" });
      setEditingId(null);
      await fetchProjects();
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to save project");
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
        <button className="ml-4 px-3 py-1 border rounded" onClick={handleLogout}>Logout</button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Project" : "Add New Project"}</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border px-4 py-2 rounded" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border px-4 py-2 rounded" required />
          <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub URL" className="w-full border px-4 py-2 rounded" />
          <input name="demo" value={form.demo} onChange={handleChange} placeholder="Live Demo URL" className="w-full border px-4 py-2 rounded" />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "Saving..." : editingId ? "Update Project" : "Add Project"}</button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="border p-4 cursor-pointer flex gap-4 flex-col md:flex-row" onClick={() => handleEdit(p)}>
            <div className="flex gap-2 flex-wrap">
              {p.media?.map((m, idx) => {
                if (!m?.url) return null;
                const url = m.url.toLowerCase();
                if (url.endsWith(".mp4")) {
                  return <video key={idx} src={m.url} className="w-24 h-16 object-cover rounded" controls />;
                }
                return <Image key={idx} src={m.url} width={96} height={64} alt={p.title || `Media ${idx + 1}`} className="object-cover rounded" />;
              })}
            </div>
            <div className="font-semibold mt-2 md:mt-0 md:ml-4">{p.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
