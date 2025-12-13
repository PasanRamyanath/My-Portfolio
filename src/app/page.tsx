import HeroSection from "./components/HeroSection";
import TechStacksSection from "./components/TechStacksSection";
import AboutSection from "./components/AboutSection";
import Navbar from "./components/Navbar";
import { Metadata } from "next";
import SocialsSection from "./components/SocialsSection";
import ProjectsSection from "./components/ProjectsSection";

export const metadata: Metadata = {
  title: "Pasan Ramyanath",
  description: "Explore the services offered by Pasan Ramyanath.",
};


export default function Home() {
  return (
    <main>
      <HeroSection />
      {/* Navbar appears after hero, will stick to top once scrolled */}
      <Navbar deferUntilScroll />
      <TechStacksSection />
      <AboutSection />
      <ProjectsSection />
      <SocialsSection />
    </main>
  );
}
