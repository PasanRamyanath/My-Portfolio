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
        className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
      >
        {currentSrc ? (
          <div className="relative w-full h-40 sm:h-44 md:h-48 bg-gray-100 overflow-hidden">
            {media.map((m, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {m.endsWith(".mp4") || m.endsWith(".webm") ? (
                  <video src={m} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                ) : (
                  <Image src={m} alt={`${project.title}-${i}`} fill className="object-cover object-center" />
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
                <span key={t} className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {t}
                </span>
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

  const filteredProjects = selectedType === "all" ? projects : projects.filter((p) => p.type === selectedType);

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Projects</h2>
          <p className="text-gray-600 text-lg">Things I&apos;ve built over time</p>
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
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => router.push(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
