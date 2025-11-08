"use client";

import Link from "next/link";
import React from "react";
import useSiteInfo from "@/lib/useSiteInfo";

export default function AboutSection() {
  const { info, loading } = useSiteInfo();
  const skills = info?.techStacks && info.techStacks.length > 0 ? info.techStacks : ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "Firebase"];
  const passions = info?.passions && info.passions.length > 0 ? info.passions : [
    "Building intuitive user experiences",
    "Open-source contribution",
    "Performance optimization",
    "3D & web graphics",
  ];

  return (
  <section id="about" className="relative py-10 static-bg ">
    
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* <div className="absolute -left-20 -top-10 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl transform rotate-12 animate-pulse" />

        <div className="absolute -right-28 top-24 w-96 h-96 bg-pink-300/25 rounded-full blur-2xl transform -rotate-6" /> */}

        <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

  <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-8">
          {loading ? (
            <div className="space-y-4 mb-8">
              <div className="w-36 h-6 bg-slate-700 rounded-full animate-pulse" />
              <div className="w-4/6 h-4 bg-slate-700 rounded-md animate-pulse" />
              <div className="w-2/3 h-4 bg-slate-700 rounded-md animate-pulse" />
            </div>
          ) : (
            <>
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold text-blue-300 tracking-wider uppercase bg-blue-950/40 px-4 py-1.5 rounded-full border border-blue-900/40">
                  About Me
                </span>
              </div>

              <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
                {info?.description ?? "I\'m focused on building accessible, fast, and delightful web applications. I enjoy turning ideas into products and learning new web technologies along the way."}
              </p>
            </>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
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
        </div>

  <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100">Core Skills</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700 rounded-lg animate-pulse" />
                ))
              ) : (
                skills.map((s, idx) => (
                  <div 
                    key={s} 
                    className="group px-4 py-3 bg-slate-800/70 rounded-xl text-center border border-white/10 hover:border-blue-500/50 hover:shadow-md transition-all duration-300 cursor-default"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                      {s}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100">What I Love</h3>
            </div>
            <ul className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-slate-700 rounded-lg animate-pulse" />
                    <div className="w-48 h-4 bg-slate-700 rounded-md animate-pulse" />
                  </li>
                ))
              ) : (
                passions.map((p, idx) => (
                  <li 
                    key={p} 
                    className="flex items-start gap-3 group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="mt-1 w-6 h-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-purple-800/40">
                      <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                      {p}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
