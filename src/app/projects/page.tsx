"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  description: string;
  github?: string;
  demo?: string;
  image?: string | { url: string; fileId?: string };
  type?: string;
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
      const projectsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      setProjects(projectsData);

      const types = Array.from(new Set(projectsData.map((p) => p.type).filter(Boolean))) as string[];
      setProjectTypes(types);
    };

    fetchProjects();
  }, []);

  // helper: return array of media urls (handles media0..mediaN objects or legacy image)
  const getMediaFromProject = (p: Project) => {
    if (!p) return [] as string[];
    // prefer media array if present
    if ((p as any).media && Array.isArray((p as any).media) && (p as any).media.length > 0) {
      return (p as any).media.map((v: any) => (typeof v === 'string' ? v : v?.url)).filter(Boolean) as string[];
    }
    // collect keys like media0, media1, ... in order (legacy)
    const keys = Object.keys(p).filter((k) => /^media\d+$/.test(k)).sort((a, b) => {
      const na = parseInt(a.replace("media", ""), 10);
      const nb = parseInt(b.replace("media", ""), 10);
      return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
    });
    const values = keys.map((k) => (p as any)[k]).filter(Boolean) as any[];
    const urls = values.map((v) => (typeof v === 'string' ? v : v?.url)).filter(Boolean) as string[];
    if (urls.length > 0) return urls;
    if (p.image) return [typeof p.image === 'string' ? p.image : (p.image as any).url];
    return [] as string[];
  };

  // helper: normalize tech stacks from new or legacy fields
  const getTechListFromProject = (p: Project) => {
    const techField = (p as any)["tech-stacks"] ?? (p as any).techStacks ?? (p as any).tech;
    if (Array.isArray(techField)) return techField as string[];
    if (typeof techField === "string") return techField.split(",").map((s) => s.trim()).filter(Boolean);
    return [] as string[];
  };

  // ProjectCard: cycles through media items with delay, pauses on hover
  function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
    const media = getMediaFromProject(project);
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const delay = 2500; // 2.5s

    useEffect(() => {
      if (!media || media.length === 0) return;
      if (isPaused) return;
      const id = setInterval(() => setIndex((i) => (i + 1) % media.length), delay);
      return () => clearInterval(id);
    }, [media, isPaused]);

    useEffect(() => setIndex(0), [project.id]);

    const src = media.length > 0 ? media[index] : (typeof project.image === 'string' ? project.image : project.image?.url);

    return (
      <div
        onClick={onOpen}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
      >
        {/* media stack with smooth opacity transitions */}
        {media && media.length > 0 ? (
          <div className="relative w-full h-40 sm:h-44 md:h-48 bg-gray-100 overflow-hidden">
            {media.map((m, i) => (
              <div
                key={m + i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                {m.endsWith('.mp4') || m.endsWith('.webm') ? (
                  <video src={m} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                ) : (
                  <img src={m} alt={`${project.title}-${i}`} className="w-full h-full object-cover object-center" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            <span className="text-sm">No image</span>
          </div>
        )}

        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 mb-2 line-clamp-3">{project.description}</p>

          {getTechListFromProject(project).length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {getTechListFromProject(project).map((t) => (
                <span key={t} className="px-2 py-1 bg-gray-100 rounded text-sm">{t}</span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {project.github && (
              <a
                onClick={(e) => e.stopPropagation()}
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-gray-900 hover:text-gray-700 font-medium transition-colors underline"
              >
                GitHub →
              </a>
            )}
            {project.demo && (
              <a
                onClick={(e) => e.stopPropagation()}
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors underline"
              >
                Live Demo →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filteredProjects =
    selectedType === "all" ? projects : projects.filter((p) => p.type === selectedType);

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Projects</h2>
          <p className="text-gray-600 text-lg">Things I've built over time</p>
        </div>

        {projectTypes.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-6 py-3 rounded-lg font-semibold text-base transition-all ${
                  selectedType === "all"
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                }`}
              >
                All Projects
              </button>
              {projectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-3 rounded-lg font-semibold text-base transition-all ${
                    selectedType === type
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-gray-500 text-lg">Loading...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-gray-500 text-lg">No projects in this category yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => router.push(`/projects/${project.id}`)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
