"use client";

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
  [key: string]: string | string[] | (string | MediaItem)[] | MediaItem | undefined; // legacy fields
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
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

      setProjects(projectsData);

      const types = Array.from(new Set(projectsData.map((p) => p.type).filter(Boolean))) as string[];
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
    if (Array.isArray(techField)) return techField.filter((item): item is string => typeof item === "string");
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
        className="group cursor-pointer rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 bg-white/30 text-gray-900 backdrop-blur-md border border-white/20 shadow-lg"
      >
        <div className="relative w-full h-44 sm:h-52 md:h-56 bg-white/5 overflow-hidden rounded-t-2xl">
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
          <div className="absolute left-0 bottom-0 right-0 p-4 bg-gradient-to-t from-white/90 via-white/70 to-transparent">
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            <p className="text-xs text-gray-700 line-clamp-2">{project.description}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/40 bg-clip-padding backdrop-blur-sm border border-white/10 rounded-b-xl">
          {getTechListFromProject(project).length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {getTechListFromProject(project).map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-2 line-clamp-3">{project.description}</p>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-2">
              {project.github && (
                <a onClick={(e) => e.stopPropagation()} href={project.github} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm text-indigo-700 hover:text-indigo-900 font-medium transition-colors underline">
                  GitHub →
                </a>
              )}
              {project.demo && (
                <a onClick={(e) => e.stopPropagation()} href={project.demo} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm text-indigo-700 hover:text-indigo-900 font-medium transition-colors underline">
                  Live →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredProjects = selectedType === "all" ? projects : projects.filter((p) => p.type === selectedType);

  return (
    <section id="projects" className="relative py-5 static-bg overflow-hidden">
      
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-8 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl transform -rotate-12 animate-slow-float" />
        <div className="absolute right-0 -top-6 w-96 h-96 bg-indigo-200/20 rounded-full blur-2xl transform rotate-6" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Selected Projects</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Curated work that highlights problem solving, design, and engineering.</p>
        </div>

        {projectTypes.length > 0 && (
          <div className="mb-8 flex justify-center">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 ${
                  selectedType === "all"
                    ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                    : "bg-white text-gray-700 border-gray-200 hover:shadow-sm"
                }`}
              >
                All
              </button>
              {projectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 ${
                    selectedType === type
                      ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:shadow-sm"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-gray-500 text-lg text-center">Loading...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-gray-500 text-lg text-center">No projects in this category yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => router.push(`/projects/${project.id}`)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
