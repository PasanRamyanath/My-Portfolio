import type { Metadata } from "next";
import ProjectsSection from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects - Pasan Ramyanath",
  description: "Explore the projects of Pasan Ramyanath.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ProjectsSection />
    </main>
  );
}