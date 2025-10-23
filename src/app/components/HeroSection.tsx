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
      className="min-h-[80vh] md:min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 md:pt-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 -mt-16 md:-mt-30">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className={`space-y-6 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="space-y-2">
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

            <div className="flex flex-wrap gap-4">
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

            <div className="flex gap-6 pt-4">
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
            className={`flex justify-center transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white shadow-2xl">
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

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
