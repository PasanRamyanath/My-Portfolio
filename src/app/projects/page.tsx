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
  image?: string;
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
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                {project.image ? (
                  <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
