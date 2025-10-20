import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Metadata } from "next";

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  tech?: string[];
  github?: string;
  demo?: string;
  linkedin_post?: string;
  image?: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const snapshot = await getDoc(doc(db, "projects", params.id));
    const data = snapshot.exists() ? (snapshot.data() as any) : null;
    return {
      title: data?.title ? `${data.title} — Project` : "Project",
      description: data?.description ?? "Project details",
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

  return (
    <main className="min-h-screen py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <a href="/projects" className="text-sm text-blue-600 hover:underline">
            ← Back to projects
          </a>
        </div>

        <div className="flex flex-col gap-8 items-start">
          {/* Image block (full width) */}
          <div className="w-full">
            {project.image ? (
              <div className="w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 sm:h-80 md:h-[420px] lg:h-[520px] object-contain bg-white"
                />
              </div>
            ) : (
              <div className="w-full h-64 sm:h-80 md:h-[420px] lg:h-[520px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                No image
              </div>
            )}
          </div>

          {/* Content block */}
          <div className="w-full">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-gray-700 mb-6 whitespace-pre-line">{project.description}</p>

            {/* Normalize tech: allow string CSV or array */}
            {project.tech && project.tech.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Tech</h2>
                <ul className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
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
