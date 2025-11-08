"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function AdminPanelClient({ onLogout }: { onLogout?: () => void }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  const ADMIN_EMAIL = "pjramyanath@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

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
      await addDoc(collection(db, "projects"), {
        title: form.title,
        description: form.description,
        image: form.image,
        github: form.github,
        demo: form.demo,
        type: form.type,
      });
  setSuccess("Project added successfully!");
  setForm({ title: "", description: "", image: "", github: "", demo: "", type: "own" });
      setImageFile(null);
    } catch (err: any) {
      setError(err.message || "Error adding project");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    if (onLogout) onLogout();
  };

  if (loadingUser)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-64 h-4 bg-slate-700 rounded animate-pulse" />
      </div>
    );

  if (userEmail !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center mt-0 text-rose-400 bg-slate-900/60 p-6 rounded-lg border border-white/5">
          <div className="font-semibold mb-2">Access Denied</div>
          <div className="text-sm mb-4">You are not authorized to view this page.</div>
          <div>
            <button onClick={handleLogout} className="px-4 py-2 bg-rose-600 text-white rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-900/60 rounded-xl shadow-lg p-8 mt-8 border border-white/5 text-slate-100">
      <div className="flex justify-end mb-4">
        <button onClick={handleLogout} className="px-4 py-2 bg-rose-600 text-white rounded-lg">
          Logout
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-100">Add New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full bg-slate-800/60 border border-white/10 px-4 py-2 rounded text-slate-100 placeholder-slate-400"
          required
        />

        {/* Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Project type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full bg-slate-800/60 border border-white/10 px-4 py-2 rounded text-slate-100"
          >
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
          className="w-full bg-slate-800/60 border border-white/10 px-4 py-2 rounded text-slate-100 placeholder-slate-400"
          required
        />

        {/* Image Upload Section */}
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-slate-200"
          />
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={!imageFile || uploadingImage}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {uploadingImage ? "Uploading..." : "Upload Image"}
          </button>

          {form.image && (
            <div className="mt-2">
              <img src={form.image} alt="Preview" className="w-full h-40 object-cover rounded border border-white/10" />
            </div>
          )}
        </div>

        <input
          name="github"
          value={form.github}
          onChange={handleChange}
          placeholder="GitHub URL"
          className="w-full bg-slate-800/60 border border-white/10 px-4 py-2 rounded text-slate-100 placeholder-slate-400"
        />

        <input
          name="demo"
          value={form.demo}
          onChange={handleChange}
          placeholder="Live Demo URL"
          className="w-full bg-slate-800/60 border border-white/10 px-4 py-2 rounded text-slate-100 placeholder-slate-400"
        />

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Project"}
        </button>

        {success && <div className="text-emerald-300 text-center">{success}</div>}
        {error && <div className="text-rose-400 text-center">{error}</div>}
      </form>
    </div>
  );
}