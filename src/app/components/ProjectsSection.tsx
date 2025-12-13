"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  [key: string]: any;
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const col = collection(db, "projects");
        const snapshot = await getDocs(col);
        const projectsData: Project[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Project),
          id: doc.id,
        }));

        // Filter only selected projects
        const selected = projectsData.filter((p) => p.selected === true);
        setProjects(selected);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getFirstMedia = (project: Project): string | null => {
    // Check media array first
    if (project.media && Array.isArray(project.media) && project.media.length > 0) {
      const first = project.media[0];
      return typeof first === "string" ? first : first.url;
    }

    // Check legacy media0
    if (project.media0) {
      return typeof project.media0 === "string" ? project.media0 : project.media0.url;
    }

    // Check image field
    if (project.image) {
      return typeof project.image === "string" ? project.image : project.image.url;
    }

    return null;
  };

  const getTechList = (project: Project): string[] => {
    const techField = project["tech-stacks"] ?? project.techStacks ?? project.tech;
    if (Array.isArray(techField)) {
      return techField.map((item) => (typeof item === "string" ? item : "")).filter(Boolean);
    }
    if (typeof techField === "string") {
      return techField.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  if (loading) {
    return (
      <section id="projects" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-10 bg-gray-200 rounded animate-pulse max-w-xs mx-auto mb-4" />
            <div className="h-6 bg-gray-200 rounded animate-pulse max-w-md mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null; // Don't show section if no selected projects
  }

  return (
    <section id="projects" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title (reuse global Initio style) */}
        <h2 className="initio-section-title mb-10 text-center"><span>Projects</span></h2>

        <p className="text-[#7C7C7C] text-base max-w-2xl mx-auto text-center mb-12">
          A curated selection of projects that showcase my skills and experience.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {projects.slice(0, 4).map((project) => {
            const thumb = getFirstMedia(project);
            const isVideoThumb = thumb ? isVideo(thumb) : false;
            const techList = getTechList(project);

            return (
              <article
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="cursor-pointer rounded-none p-6 bg-[#f3f3f3] border border-[#e1e1e1] shadow-[0_0_0_1px_#e1e1e1,0_0_0_3px_#fff,0_0_0_4px_#e1e1e1] hover:shadow-none transition-all flex flex-col h-full"
              >
                {thumb && (
                  <div className="w-full h-44 mb-4 bg-black/5 overflow-hidden rounded">
                    {isVideoThumb ? (
                      <video
                        src={thumb}
                        className="object-cover w-full h-full"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={thumb}
                        alt={project.title}
                        width={1200}
                        height={700}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#333] mb-2 uppercase tracking-wide">
                    {project.title}
                  </h3>
                  <p className="text-sm text-[#666] mb-4 line-clamp-3">{project.description}</p>

                  {techList.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {techList.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium text-[#bd1550] border border-[#bd1550] rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  {project.github && (
                    <a
                      onClick={(e) => { e.stopPropagation(); }}
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 text-sm rounded bg-slate-700 text-white hover:text-white hover:bg-slate-600 transition-colors text-center"
                    >
                      <span style={{ color: 'white' }}>GitHub</span>
                    </a>
                  )}
                  {project.demo && (
                    <a
                      onClick={(e) => { e.stopPropagation(); }}
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 text-sm rounded bg-emerald-600 text-white hover:text-white hover:bg-emerald-500 transition-colors text-center"
                    >
                      <span style={{ color: 'white' }}>Live</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/projects"
            className="inline-block px-8 py-3 bg-[#bd1550] text-white hover:text-white font-bold text-sm uppercase tracking-wide hover:bg-[#e61f65] transition-colors rounded"
          >
            <span style={{ color: 'white' }}>View All Projects</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
