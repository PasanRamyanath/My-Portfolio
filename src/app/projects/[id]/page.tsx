import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Metadata } from "next";
import ProjectMediaViewer from "../ProjectMediaViewer";

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  tech?: string[];
  github?: string;
  demo?: string;
  linkedin_post?: string;
  image?: string | { url: string; fileId?: string };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const snapshot = await getDoc(doc(db, "projects", params.id));
    const data = snapshot.exists() ? (snapshot.data() as any) : null;
    return {
      title: data?.title ? `${data.title} — Project` : "Project",
      description: data?.["long-description"] ?? data?.longDescription ?? data?.description ?? "Project details",
    };
  } catch (e) {
    return { title: "Project", description: "Project details" };
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const snapshot = await getDoc(doc(db, "projects", params.id));
  if (!snapshot.exists()) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Project not found</h1>
          <p className="text-gray-600 mt-2">The project you're looking for doesn't exist.</p>
        </div>
      </main>
    );
  }

  const project = snapshot.data() as ProjectDetail;

  // build media array: prefer `media` array, fall back to legacy media0..mediaN or image
  const buildMediaArray = (p: any) => {
    if (!p) return [] as string[];
    if (Array.isArray(p.media) && p.media.length > 0) return p.media.map((v: any) => (typeof v === 'string' ? v : v?.url)).filter(Boolean) as string[];
    const keys = Object.keys(p).filter((k) => /^media\d+$/.test(k)).sort((a, b) => {
      const na = parseInt(a.replace("media", ""), 10);
      const nb = parseInt(b.replace("media", ""), 10);
      return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
    });
    const values = keys.map((k) => p[k]).filter(Boolean) as any[];
    const urls = values.map((v) => (typeof v === 'string' ? v : v?.url)).filter(Boolean) as string[];
    if (urls.length > 0) return urls;
    if (p.image) return [typeof p.image === 'string' ? p.image : p.image?.url];
    return [] as string[];
  };
  const media = buildMediaArray(project);
  // normalize tech field: prefer 'tech-stacks' or 'techStacks', otherwise support 'tech' array or CSV string
  const techField = (project as any)['tech-stacks'] ?? (project as any).techStacks ?? project.tech;
  const techList: string[] = Array.isArray(techField)
    ? (techField as string[])
    : typeof techField === 'string'
    ? (techField as string).split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <a href="/projects" className="text-sm text-blue-600 hover:underline">
            ← Back to projects
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Image column (larger on md+) */}
          <div className="md:col-span-3">
            <ProjectMediaViewer media={media} title={project.title} />
          </div>

          {/* Content column */}
          <div className="md:col-span-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-gray-700 mb-6 whitespace-pre-line">{(project as any)["long-description"] ?? (project as any).longDescription ?? project.description}</p>

            {/* Normalize tech: allow string CSV or array */}
            {techList.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Tech</h2>
                <ul className="flex flex-wrap gap-2">
                  {techList.map((t) => (
                    <li key={t} className="px-3 py-1 bg-gray-100 rounded text-sm">
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              {project.github && (
                <a href={project.github} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-900 text-white rounded">
                  GitHub
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Live Demo
                </a>
              )}
              {project.linkedin_post && (
                <a href={project.linkedin_post} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded">
                  LinkedIn Post
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
