import HeroSection from "./components/HeroSection"
import AboutSection from "./components/AboutSection"
import Link from "next/link"

export default function Home() {
  return (
    <main>
      <HeroSection />
      
      <AboutSection />
    </main>
  )
}
