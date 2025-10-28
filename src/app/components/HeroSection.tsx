"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Profile3D = dynamic(() => import("../components/Profile3D"), { ssr: false });
const me = "/me.glb";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section
      id="home"
      className="min-h-[60vh] md:min-h-[70vh] flex items-center justify-center static-bg pt-0"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div
            className={`space-y-4 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="space-y-1">
              <p className="text-blue-600 font-semibold text-sm sm:text-base">Hi, I&apos;m</p>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900">Your Name</h1>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Full Stack Developer
              </h2>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              I craft beautiful, functional websites and applications that solve
              real-world problems. Specializing in modern web technologies and
              user-centered design.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                View Projects
              </Link>
              <a
                href="#about"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transform hover:scale-105 transition-all"
              >
                About Me
              </a>
            </div>

            <div className="flex gap-4 pt-2 flex-wrap">
              {["React", "Next.js", "TypeScript", "Node.js"].map((tech) => (
                <div
                  key={tech}
                  className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <span className="text-sm font-medium text-gray-700">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - 3D Model */}
          <div
            className={`flex justify-center items-center transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-2xl flex-shrink-0">
              {mounted && <Profile3D modelPath={me} />}

              <div
                className="absolute inset-0 rounded-full pointer-events-none -z-20 blur-md"
                style={{
                  background:
                    "conic-gradient(from 180deg at 50% 50%, rgba(99,102,241,0.10), rgba(59,130,246,0.06), rgba(167,139,250,0.10))",
                  opacity: 0.18,
                }}
              />

              <div
                className="absolute inset-0 rounded-full pointer-events-none -z-10"
                style={{
                  background:
                    "radial-gradient(circle at 28% 22%, rgba(59,130,246,0.20) 0%, rgba(167,139,250,0.14) 35%, rgba(255,255,255,0) 65%)",
                }}
              />

              <div
                className="absolute inset-0 rounded-full pointer-events-none -z-5"
                style={{
                  boxShadow:
                    "0 18px 60px rgba(99,102,241,0.10), inset 0 6px 20px rgba(255,255,255,0.06)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      
    </section>
  );
}
