"use client";

import Image from "next/image";
import { useState } from "react";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  demo: string;
}

export default function ProjectsSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const projects: Project[] = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description:
        "A full-stack e-commerce solution with payment integration, inventory management, and real-time analytics.",
      image: "/project1.png",
      technologies: ["Next.js", "TypeScript", "Stripe", "Firebase"],
      github: "https://github.com/yourusername/project1",
      demo: "https://project1-demo.com",
    },
    {
      id: 2,
      title: "Social Media Dashboard",
      description:
        "Analytics dashboard for social media metrics with beautiful data visualizations and real-time updates.",
      image: "/project2.png",
      technologies: ["React", "Node.js", "Chart.js", "MongoDB"],
      github: "https://github.com/yourusername/project2",
      demo: "https://project2-demo.com",
    },
    {
      id: 3,
      title: "Task Management App",
      description:
        "Collaborative task management tool with drag-and-drop functionality and team collaboration features.",
      image: "/project1.png",
      technologies: ["React", "Firebase", "Tailwind CSS", "Redux"],
      github: "https://github.com/yourusername/project3",
      demo: "https://project3-demo.com",
    },
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A showcase of my recent work, demonstrating my skills in web
            development and problem-solving.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className={`object-cover transition-transform duration-500 ${
                    hoveredId === project.id ? "scale-110" : "scale-100"
                  }`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
                    hoveredId === project.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-center font-medium hover:bg-gray-800 transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                  >
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
            View All Projects
          </button>
        </div>
      </div>
    </section>
  );
}