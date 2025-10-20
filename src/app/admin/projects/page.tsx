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
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

interface Project {
  id: string;
  title: string;
  description: string;
  github?: string;
  demo?: string;
  image?: string;
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
    image: "",
    github: "",
    demo: "",
    type: "own",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

  const handleImageUpload = async () => {
    if (!imageFile) {
      setError("Please select an image to upload.");
      return;
    }

    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      setForm((prev) => ({ ...prev, image: data.url }));
      setSuccess("Image uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), {
          title: form.title,
          description: form.description,
          image: form.image,
          github: form.github,
          demo: form.demo,
          type: form.type,
        });
        setSuccess("Project updated successfully!");
      } else {
        await addDoc(collection(db, "projects"), {
          title: form.title,
          description: form.description,
          image: form.image,
          github: form.github,
          demo: form.demo,
          type: form.type,
        });
        setSuccess("Project added successfully!");
      }

      setForm({ title: "", description: "", image: "", github: "", demo: "", type: "own" });
      setImageFile(null);
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
    setForm({
      title: p.title || "",
      description: p.description || "",
      image: p.image || "",
      github: p.github || "",
      demo: p.demo || "",
      type: p.type || "own",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
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

          {/* Image Upload Section */}
          <div className="space-y-2">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            <div className="flex gap-2">
              <button type="button" onClick={handleImageUpload} disabled={!imageFile || uploadingImage} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </button>
              {form.image && (
                <div className="mt-2">
                  <img src={form.image} alt="Preview" className="w-48 h-28 object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub URL" className="w-full border px-4 py-2 rounded" />

          <input name="demo" value={form.demo} onChange={handleChange} placeholder="Live Demo URL" className="w-full border px-4 py-2 rounded" />

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Project" : "Add Project"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", description: "", image: "", github: "", demo: "", type: "own" }); }} className="px-4 py-2 bg-gray-200 rounded">
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
                {p.image && <img src={p.image} alt={p.title} className="w-24 h-16 object-cover rounded" />}
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
                    {selectedProject.image && (
                      <div className="w-full mb-6 flex justify-center">
                        <img src={selectedProject.image} alt={selectedProject.title} className="w-full max-w-full max-h-[60vh] object-contain rounded" />
                      </div>
                    )}

                    <h2 className="text-2xl font-bold mb-2">{selectedProject.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">Type: {selectedProject.type}</p>
                    <div className="prose max-w-none text-gray-700 mb-4">{selectedProject.description}</div>

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
