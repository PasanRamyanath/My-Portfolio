import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Metadata } from "next";
import Image from "next/image";
import ProjectMediaViewerClient from "../ProjectMediaViewer";
import BackButton from "@/app/components/BackButton";

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

interface ProjectPageParams {
  id: string;
}

// Metadata must be in a server component
export async function generateMetadata({ params }: { params?: Promise<ProjectPageParams> }): Promise<Metadata> {
  try {
    const resolvedParams = params ? await params : undefined;
    if (!resolvedParams?.id) return { title: "Project", description: "Project details" };
    const snapshot = await getDoc(doc(db, "projects", resolvedParams.id));
    const data = snapshot.exists() ? (snapshot.data() as ProjectDetail) : null;

    return {
      title: data?.title ? `${data.title} — Project` : "Project",
      description: data?.["long-description"] ?? data?.longDescription ?? data?.description ?? "Project details",
    };
  } catch {
    return { title: "Project", description: "Project details" };
  }
}

export default async function ProjectDetailPage({ params }: { params?: Promise<ProjectPageParams> }) {
  const resolvedParams = params ? await params : undefined;
  if (!resolvedParams?.id) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Project not found</h1>
          <p className="text-gray-600 mt-2">The project you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </main>
    );
  }
  const snapshot = await getDoc(doc(db, "projects", resolvedParams.id));
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

  const buildMediaArray = (p: ProjectDetail): string[] => {
    if (!p) return [];
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

  const normalizeUrl = (u?: string) => {
    if (!u) return undefined;
    // If it already has a protocol, return as-is
    if (/^\w+:\/\//i.test(u)) return u;
    // Otherwise assume https
    return `https://${u}`;
  };

  const demoUrl = normalizeUrl(project.demo as string | undefined);
  const githubUrl = normalizeUrl(project.github as string | undefined) ?? project.github;
  const linkedinUrl = normalizeUrl(project.linkedin_post as string | undefined) ?? project.linkedin_post;

  return (
    <main className="min-h-screen py-12 static-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </BackButton>
        </div>

        <div className="grid grid-cols-1 gap-8 items-start">
          {/* Media area with vertical thumbnails on md+ */}
          <div>
            <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-2 sm:p-3 border border-white/10 ring-1 ring-white/5 shadow-xl">
                <div className="overflow-hidden rounded-xl w-full">
                  <ProjectMediaViewerClient media={media} title={project.title} />
                </div>
            </div>
          </div>

          {/* Info panel moved below media as a full-width card */}
          <div>
            <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-6 sm:p-8 border border-white/10 ring-1 ring-white/5 shadow-xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-100 mb-4">{project.title}</h1>
              <p className="text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
                {project["long-description"] ?? project.longDescription ?? project.description}
              </p>

              {techList.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-sm font-semibold tracking-wide text-indigo-300 uppercase mb-3">Tech</h2>
                  <ul className="flex flex-wrap gap-2">
                    {techList.map((t) => (
                      <li
                        key={t}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/30 text-indigo-300 border border-indigo-800/40"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span style={{ color: 'white' }}>Live Demo</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </a>
                )}
                {project.github && (
                  <a
                    href={githubUrl ?? project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 text-slate-200 rounded-xl font-semibold border-2 border-slate-700 hover:border-blue-400 hover:text-blue-300 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Image src="/footer/Github.png" alt="GitHub" width={20} height={20} />
                    <span style={{ color: 'white' }}>GitHub</span>
                  </a>
                )}
                {project.linkedin_post && (
                  <a
                    href={linkedinUrl ?? project.linkedin_post}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600/80 text-white rounded-xl font-semibold border-2 border-indigo-500/60 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    LinkedIn Post
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
