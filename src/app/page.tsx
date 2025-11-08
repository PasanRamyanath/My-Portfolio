import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasan Ramyanath",
  description: "Explore the services offered by Pasan Ramyanath.",
};


export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
    </main>
  );
}
