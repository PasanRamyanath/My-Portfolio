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
  <section id="about" className="relative min-h-screen py-10 static-bg ">
    
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

  <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
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

            </>
          )}

          
        </div>

  <div className="grid md:grid-cols-2 gap-8 mt-10 items-stretch h-full">
    {/* Left: What I Love card (visual left) */}
  <div className="w-full md:col-start-1 bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Make What I Love content (moved left) */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-700 rounded-lg animate-pulse" />
              <div className="w-48 h-4 bg-slate-700 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6 justify-start">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-100">What I Love</h3>
          </div>
          <ul className="space-y-4">
            {passions.map((p, idx) => (
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
            ))}
          </ul>
        </div>
      )}
    </div>

    {/* Right: About description card (visual right) */}
  <div className="w-full md:col-start-2 bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300 flex flex-col justify-center h-full">
      {loading ? (
        <div className="space-y-3">
          <div className="w-full h-4 bg-slate-700 rounded-md animate-pulse" />
          <div className="w-5/6 h-4 bg-slate-700 rounded-md animate-pulse" />
          <div className="w-2/3 h-4 bg-slate-700 rounded-md animate-pulse" />
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-slate-100 mb-4">About Me</h3>
          <p className="text-slate-300 leading-relaxed">{info?.aboutMeDescription ?? info?.description ?? "I\'m focused on building accessible, fast, and delightful web applications. I enjoy turning ideas into products and learning new web technologies along the way."}</p>
        </div>
      )}
    </div>
  </div>
      </div>
    </section>
  );
}
