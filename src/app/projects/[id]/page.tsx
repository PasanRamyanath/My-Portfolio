import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Metadata } from "next";
import ProjectMediaViewerClient from "../ProjectMediaViewer";
import Link from "next/link";

interface MediaObject {
  url: string;
  fileId?: string;
}

interface ProjectDetail {
  id: string;
  title: string;
  description?: string;
  "long-description"?: string;
  longDescription?: string;
  tech?: string[];
  "tech-stacks"?: string[] | string;
  techStacks?: string[] | string;
  image?: string | MediaObject;
  media?: (string | MediaObject)[];
  github?: string;
  demo?: string;
  linkedin_post?: string;
  [key: string]: string | string[] | (string | MediaObject)[] | MediaObject | undefined;
}

// Metadata generation must be in a server component (no "use client")
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const snapshot = await getDoc(doc(db, "projects", params.id));
    const data = snapshot.exists() ? (snapshot.data() as ProjectDetail) : null;
    return {
      title: data?.title ? `${data.title} — Project` : "Project",
      description:
        data?.["long-description"] ?? data?.longDescription ?? data?.description ?? "Project details",
    };
  } catch {
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
          <p className="text-gray-600 mt-2">
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </main>
    );
  }

  const project = snapshot.data() as ProjectDetail;

  const buildMediaArray = (p: ProjectDetail) => {
    if (!p) return [] as string[];
    if (Array.isArray(p.media) && p.media.length > 0)
      return p.media.map((v) => (typeof v === "string" ? v : v.url)).filter(Boolean) as string[];

    const keys = Object.keys(p)
      .filter((k) => /^media\d+$/.test(k))
      .sort((a, b) => parseInt(a.replace("media", ""), 10) - parseInt(b.replace("media", ""), 10));

    const values = keys.map((k) => p[k]).filter(Boolean) as (string | MediaObject)[];
    const urls = values.map((v) => (typeof v === "string" ? v : v.url)).filter(Boolean) as string[];
    if (urls.length > 0) return urls;

    if (p.image) return [typeof p.image === "string" ? p.image : p.image.url];
    return [];
  };

  const media = buildMediaArray(project);

  const techField = project["tech-stacks"] ?? project.techStacks ?? project.tech;
  const techList: string[] = Array.isArray(techField)
    ? techField
    : typeof techField === "string"
    ? techField.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link href="/projects" className="text-sm text-blue-600 hover:underline">
            &larr; Back to projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="md:col-span-3">
            <ProjectMediaViewerClient media={media} title={project.title} />
          </div>

          <div className="md:col-span-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {project["long-description"] ?? project.longDescription ?? project.description}
            </p>

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
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-gray-900 text-white rounded"
                >
                  GitHub
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Live Demo
                </a>
              )}
              {project.linkedin_post && (
                <a
                  href={project.linkedin_post}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
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
