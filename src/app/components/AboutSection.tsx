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

  <div className="grid md:grid-cols-1 gap-8 mt-10 items-stretch h-full">
    {/* About description card (full width) */}
  <div className="w-full bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300 flex flex-col justify-center h-full">
      {loading ? (
        <div className="space-y-3">
          <div className="w-full h-4 bg-slate-700 rounded-md animate-pulse" />
          <div className="w-5/6 h-4 bg-slate-700 rounded-md animate-pulse" />
          <div className="w-2/3 h-4 bg-slate-700 rounded-md animate-pulse" />
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-slate-100 mb-4">About Me</h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{info?.aboutMeDescription ?? info?.description ?? "I\'m focused on building accessible, fast, and delightful web applications. I enjoy turning ideas into products and learning new web technologies along the way."}</p>
        </div>
      )}
    </div>
  </div>
      </div>
    </section>
  );
}
