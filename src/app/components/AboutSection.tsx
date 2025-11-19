"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
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
    <section
      id="about"
      className="relative min-h-screen py-10 static-bg"
      style={{
        background: "linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url('/about.jpg') center / cover no-repeat",
      }}
    >

      {/* Decorative faint dots behind content */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-10">
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

        <div className="grid md:grid-cols-2 gap-8 mt-10 items-stretch h-full min-h-0">
          {/* Left: side image (hidden on small screens) - show full image with creative frame */}
          <div className="hidden md:flex items-stretch justify-center h-full">
            <div className="w-full max-w-[480px] h-full rounded-xl h-full">
              <div className="relative overflow-hidden rounded-xl h-full">
                <div className="relative w-full h-full">
                  <Image src="/side_pic.jpg" alt="About" fill className="object-contain" style={{ objectPosition: 'center' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: About description card */}
          <div className="w-full bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300 flex flex-col justify-center h-full">
            {loading ? (
              <div className="space-y-3">
                <div className="w-full h-4 bg-slate-700 rounded-md animate-pulse" />
                <div className="w-5/6 h-4 bg-slate-700 rounded-md animate-pulse" />
                <div className="w-2/3 h-4 bg-slate-700 rounded-md animate-pulse" />
              </div>
            ) : (
              <div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{info?.aboutMeDescription ?? info?.description ?? "I'm focused on building accessible, fast, and delightful web applications. I enjoy turning ideas into products and learning new web technologies along the way."}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
