"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  image?: string | MediaItem;
  type?: string;
  media?: (string | MediaItem)[];
  techStacks?: string[];
  selected?: boolean;
  [key: string]: any; // legacy fields (allow mixed types like selected:boolean)
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedType, setSelectedType] = useState<string>("selected");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      const col = collection(db, "projects");
      const snapshot = await getDocs(col);
      const projectsData: Project[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Project),
        id: doc.id,
      }));

      // normalize types so only 'university' and 'private' are used
      const normalizeType = (t: any) => (t === "university" ? "university" : "private");
      const normalized = projectsData.map((p) => ({ ...p, type: normalizeType(p.type), selected: !!(p as any).selected }));
      setProjects(normalized);

      const types = Array.from(new Set(normalized.map((p) => p.type).filter(Boolean))) as string[];
      setProjectTypes(types);
    };

    fetchProjects();
  }, []);

  const getMediaFromProject = (project: Project): string[] => {
    if (!project) return [];

    if (project.media && Array.isArray(project.media) && project.media.length > 0) {
      return project.media.map((v) => (typeof v === "string" ? v : v.url)).filter(Boolean);
    }

    // legacy media keys: media0, media1, ...
    const legacyKeys = Object.keys(project)
      .filter((k) => /^media\d+$/.test(k))
      .sort((a, b) => parseInt(a.replace("media", ""), 10) - parseInt(b.replace("media", ""), 10));

    const legacyUrls = legacyKeys
      .map((k) => {
        const val = project[k];
        if (!val) return null;
        if (typeof val === "string") return val;
        if (Array.isArray(val)) return null;
        return (val as MediaItem).url;
      })
      .filter(Boolean) as string[];

    if (legacyUrls.length > 0) return legacyUrls;

    if (project.image) return [typeof project.image === "string" ? project.image : project.image.url];

    return [];
  };

  const getTechListFromProject = (project: Project): string[] => {
    const techField: string | string[] | (string | MediaItem)[] | MediaItem | undefined =
      project["tech-stacks"] ?? project.techStacks ?? project.tech;
    if (Array.isArray(techField)) return techField.map((item) => (typeof item === "string" ? item : "")).filter(Boolean);
    if (typeof techField === "string") return techField.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
    const media = getMediaFromProject(project);
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const delay = 2500;

    useEffect(() => {
      if (!media.length || isPaused) return;
      const id = setInterval(() => setIndex((i) => (i + 1) % media.length), delay);
      return () => clearInterval(id);
    }, [media, isPaused]);

    useEffect(() => setIndex(0), [project.id]);

    const currentSrc = media.length > 0 ? media[index] : typeof project.image === "string" ? project.image : project.image?.url;

    return (
      <div
        onClick={onOpen}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
  className="group cursor-pointer rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 bg-slate-800/40 text-slate-200 backdrop-blur-md border border-white/10 shadow-lg"
      >
  <div className="relative w-full h-44 sm:h-52 md:h-56 bg-black/20 overflow-hidden rounded-t-2xl">
          {currentSrc ? (
            media.map((m, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {m.endsWith(".mp4") || m.endsWith(".webm") ? (
                  <video src={m} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                ) : (
                  <Image src={m} alt={`${project.title}-${i}`} fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                )}
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
          )}

          {/* gradient overlay + title (light glass style) */}
          <div className="absolute left-0 bottom-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="text-lg font-semibold text-slate-100">{project.title}</h3>
            <p className="text-xs text-slate-300 line-clamp-2">{project.description}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-800/40 bg-clip-padding backdrop-blur-sm border border-white/10 rounded-b-xl">
          {getTechListFromProject(project).length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {getTechListFromProject(project).map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-sm font-medium border border-indigo-800/40">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-2">
            <p className="text-sm text-slate-300 mb-2 line-clamp-3">{project.description}</p>
            <div className="flex gap-2">
              {project.github && (
                <a
                  onClick={(e) => e.stopPropagation()}
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-sm rounded-full bg-slate-600 text-white hover:bg-slate-500 font-medium transition-colors text-center"
                >
                  GitHub
                </a>
              )}
              {project.demo && (
                <a
                  onClick={(e) => e.stopPropagation()}
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-sm rounded-full bg-emerald-600 text-white hover:bg-emerald-500 font-medium transition-colors text-center"
                >
                  Live
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedProjects = projects.filter((p) => !!(p as any).selected);
  const filteredProjects =
    selectedType === "all"
      ? projects
      : selectedType === "selected"
      ? projects.filter((p) => !!p.selected)
      : projects.filter((p) => p.type === selectedType);

  return (
    <section id="projects" className="relative py-5 static-bg overflow-hidden">
      
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-8 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl transform -rotate-12 animate-slow-float" />
        <div className="absolute right-0 -top-6 w-96 h-96 bg-indigo-200/20 rounded-full blur-2xl transform rotate-6" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-5xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Selected Projects</h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">Curated work that highlights problem solving, design, and engineering.</p>
        </div>

        {projectTypes.length > 0 && (
          <div className="mb-8 flex justify-center">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedType("selected")}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 ${
                  selectedType === "selected"
                    ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-200 border-slate-700 hover:shadow-sm"
                }`}
              >
                Selected
              </button>

              <button
                onClick={() => setSelectedType("university")}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 ${
                  selectedType === "university"
                    ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-200 border-slate-700 hover:shadow-sm"
                }`}
              >
                University
              </button>

              <button
                onClick={() => setSelectedType("private")}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 ${
                  selectedType === "private"
                    ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-200 border-slate-700 hover:shadow-sm"
                }`}
              >
                Private
              </button>

              <button
                onClick={() => setSelectedType("all")}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 ${
                  selectedType === "all"
                    ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-200 border-slate-700 hover:shadow-sm"
                }`}
              >
                All
              </button>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-slate-400 text-lg text-center">Loading...</div>
        ) : selectedType === "all" ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4">All Projects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects
                  .slice()
                  .sort((a, b) => {
                    // selected first
                    if (!!a.selected && !b.selected) return -1;
                    if (!a.selected && !!b.selected) return 1;
                    // then by type: private before university
                    const rank = (t?: string) => (t === 'private' ? 0 : t === 'university' ? 1 : 2);
                    return rank(a.type) - rank(b.type);
                  })
                  .map((project) => (
                    <ProjectCard key={project.id} project={project} onOpen={() => router.push(`/projects/${project.id}`)} />
                  ))}
              </div>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-slate-400 text-lg text-center">No projects in this category yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects
              .slice()
              .sort((a, b) => ((b.selected ? 1 : 0) - (a.selected ? 1 : 0)))
              .map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={() => router.push(`/projects/${project.id}`)} />
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
