"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import useSiteInfo from "@/lib/useSiteInfo";
import React from "react";

export default function TechStacksSection() {
  const { info, loading } = useSiteInfo();
  // Build categorized stacks: prefer info.techStacksByCategory, else fallback to flat array under General
  const categorized: Record<string, string[]> = React.useMemo(() => {
    if (info?.techStacksByCategory && Object.keys(info.techStacksByCategory).length > 0) {
      // filter out empty arrays
      const filtered: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(info.techStacksByCategory)) {
        if (Array.isArray(v) && v.length > 0) filtered[k] = v;
      }
      return filtered;
    }
    if (info?.techStacks && info.techStacks.length > 0) {
      return { General: info.techStacks };
    }
    return {};
  }, [info]);

  const categoryEntries = Object.entries(categorized).sort((a, b) => a[0].localeCompare(b[0]));

  return (
  <section id="stack" className="relative min-h-screen py-16 static-bg">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-10 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-purple-400/10 rounded-full blur-2xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="techgrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="2" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#techgrid)" />
        </svg>
      </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full grid grid-rows-[auto_auto] gap-y-10 md:gap-y-14 items-start pt-4 md:pt-12">
    <div className="text-center mb-4 relative">
          <span className="inline-block text-[11px] tracking-wider uppercase font-semibold text-indigo-300 bg-indigo-950/50 px-5 py-2 rounded-full border border-indigo-800/50 shadow-sm shadow-indigo-900/30 mb-5 backdrop-blur-sm">
            Tech Stack
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-5 drop-shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
            Tools & Technologies I Use
          </h2>
          <p className="text-slate-300/90 max-w-2xl mx-auto text-base leading-relaxed">
            A concise overview of the frameworks, languages and platforms I use regularly to craft performant, maintainable solutions.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 w-[240px] sm:w-[260px] rounded-2xl bg-slate-800/40 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : categoryEntries.length === 0 ? (
          <div className="text-center text-slate-400">No tech stacks added yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
            {categoryEntries.map(([category, items]) => (
              <TechCategoryCard key={category} category={category} items={items} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TechCategoryCard({ category, items }: { category: string; items: string[] }) {
  return (
    <div className="group relative w-[240px] sm:w-[260px] h-56 rounded-2xl bg-slate-900/40 bg-clip-padding backdrop-blur-xl border border-white/10 ring-1 ring-white/5 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-400/40">
      <div className="mb-5 text-center flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600/70 to-purple-600/70 flex items-center justify-center shadow-md shadow-indigo-900/30">
          <span className="text-sm font-semibold text-white">{category.charAt(0)}</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-100 tracking-wide">{category}</h3>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-indigo-950/40 text-indigo-200 border border-indigo-800/50 shadow-sm shadow-indigo-900/20 hover:border-indigo-500/70 hover:text-indigo-100 transition-colors"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl" />
    </div>
  );
}
