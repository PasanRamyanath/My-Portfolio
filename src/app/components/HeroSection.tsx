"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import useSiteInfo from "@/lib/useSiteInfo";

const Profile3D = dynamic(() => import("../components/Profile3D"), { ssr: false });
const me = "/me.glb";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const { info, loading } = useSiteInfo();

  useEffect(() => setMounted(true), []);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center static-bg pt-0"
    >
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-0 h-full flex items-center">
  <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center w-full md:items-start md:transform md:-translate-y-8">
          {/* Left Content */}
          <div
            className={`space-y-12 text-center md:text-left md:max-w-none mx-auto md:mx-0 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <div className="w-24 h-4 bg-slate-700 rounded-full animate-pulse" />
                  <div className="w-72 h-10 bg-slate-700 rounded-md animate-pulse" />
                  <div className="w-48 h-6 bg-slate-700 rounded-md animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-blue-400 font-semibold text-sm sm:text-base">Hi, I&apos;m</p>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-100">{info?.displayName ?? info?.initialName ?? "Pasan Ramyanath"}</h1>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {info?.shortDescription ?? (info?.description ? info.description.split(". ")[0] : "Tech Enthusiast")}
                  </h2>
                </>
              )}
            </div>

            {loading ? (
              <div className="space-y-2 mt-4">
                <div className="w-full h-4 bg-slate-700 rounded-md animate-pulse" />
                <div className="w-5/6 h-4 bg-slate-700 rounded-md animate-pulse" />
                <div className="w-2/3 h-4 bg-slate-700 rounded-md animate-pulse" />
              </div>
            ) : (
              <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                {info?.description ?? info?.aboutMeDescription ?? "I craft beautiful, functional websites and applications that solve real-world problems. Specializing in modern web technologies and user-centered design."}
              </p>
            )}

            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>See My Work</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <a
                href="/cv.pdf"
                download
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800/80 text-slate-200 rounded-xl font-semibold border-2 border-slate-700 hover:border-blue-400 hover:text-blue-300 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download CV</span>
              </a>
            </div>

            {/* Tech stacks moved to dedicated TechStacksSection */}
          </div>

          {/* Right Content - 3D Model */}
          <div
            className={`flex justify-center items-center transition-all duration-1000 delay-300 gap-1 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl">
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
