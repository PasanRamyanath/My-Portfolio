"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import useSiteInfo from "@/lib/useSiteInfo";
import React from "react";

export default function TechStacksSection() {
  const { info, loading } = useSiteInfo();
  const [searchQuery, setSearchQuery] = React.useState("");
  
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
    <section id="stack" className="relative min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center pt-4 md:pt-12">
        <div className="text-center mb-8 relative">
          <h2 className="initio-section-title">
            <span>Tech Stack</span>
          </h2>
          <p className="text-[#7C7C7C] max-w-2xl mx-auto text-base leading-relaxed">
            An overview of the frameworks, languages, platforms and technologies I&apos;ve used to craft performant, maintainable solutions.
          </p>
          
          {/* Search input */}
          <div className="mt-6 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for a technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-[#cccccc] rounded-none text-[#333] placeholder-[#999] focus:outline-none focus:border-[#bd1550] transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-[#7C7C7C]">Loading tech stacks...</div>
          </div>
        ) : categoryEntries.length === 0 ? (
          <div className="text-center text-[#7C7C7C]">No tech stacks added yet.</div>
        ) : (
          <div className="flex justify-center w-full">
            <TechConstellation categories={categorized} searchQuery={searchQuery} />
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

function TechConstellation({ categories, searchQuery }: { categories: Record<string, string[]>; searchQuery: string }) {
  const width = 900;
  const height = 300; // further reduced height for a more compact window
  const centerX = width / 2;
  const centerY = height / 2;
  const categoryRadius = 100; // reduced distance of category centers from the center

  const categoryEntries = Object.entries(categories);
  const totalCategories = categoryEntries.length;

  // Normalize search query for case-insensitive matching
  const normalizedSearch = searchQuery.trim().toLowerCase();

  // Position each category in a circle around the center
  const categoryPositions: Record<
    string,
    { 
      x: number; 
      y: number; 
      techs: { name: string; x: number; y: number }[] 
    }
  > = {};

  // Lay out categories horizontally across the SVG so different types are spaced
  // evenly. If there's only one category, center it.
  const paddingX = 80;
  const availableWidth = Math.max(0, width - paddingX * 2);
  categoryEntries.forEach(([category, items], index) => {
    const catX = totalCategories > 1
      ? paddingX + (index / (totalCategories - 1)) * availableWidth
      : centerX;
    const catY = centerY; // keep them vertically centered

    // Position techs in a small cluster around the category center
    const techRadius = 30;
    const techs = items.map((tech, i) => {
      const techAngle = (i / items.length) * 2 * Math.PI;
      const techX = catX + techRadius * Math.cos(techAngle);
      const techY = catY + techRadius * Math.sin(techAngle);
      return { name: tech, x: techX, y: techY };
    });

    categoryPositions[category] = { x: catX, y: catY, techs };
  });

  // Create lines connecting all techs within the same category (animated)
  const animatedConnections = Object.values(categoryPositions).map(({ techs }) => {
    const connections: Array<{
      tech1: { name: string; x: number; y: number; seed: number };
      tech2: { name: string; x: number; y: number; seed: number };
    }> = [];
    
    // Add seed to each tech for animation
    const techsWithSeed = techs.map(t => ({
      ...t,
      seed: Math.abs(Array.from(t.name).reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7))
    }));

    for (let i = 0; i < techsWithSeed.length; i++) {
      for (let j = i + 1; j < techsWithSeed.length; j++) {
        connections.push({
          tech1: techsWithSeed[i],
          tech2: techsWithSeed[j]
        });
      }
    }
    return connections;
  }).flat();

  return (
    <svg 
      width={width} 
      height={height} 
      className="bg-white"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Connection lines between techs in same category - dynamically animated to follow moving techs */}
      {animatedConnections.map((conn, i) => {
        const amp1 = 8 + (conn.tech1.seed % 12);
        const dur1 = 4 + (conn.tech1.seed % 6);
        const dx1 = Math.round((conn.tech1.seed % 3) - 1) * amp1;
        const dy1 = Math.round((conn.tech1.seed % 5) - 2) * amp1;
        
        const amp2 = 8 + (conn.tech2.seed % 12);
        const dur2 = 4 + (conn.tech2.seed % 6);
        const dx2 = Math.round((conn.tech2.seed % 3) - 1) * amp2;
        const dy2 = Math.round((conn.tech2.seed % 5) - 2) * amp2;

        return (
          <line
            key={`line-${i}`}
            stroke="#000000"
            strokeWidth="1"
            opacity="0.3"
          >
            <animate
              attributeName="x1"
              values={`${conn.tech1.x}; ${conn.tech1.x + dx1}; ${conn.tech1.x - dx1}; ${conn.tech1.x}`}
              dur={`${dur1}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y1"
              values={`${conn.tech1.y}; ${conn.tech1.y - dy1}; ${conn.tech1.y + dy1}; ${conn.tech1.y}`}
              dur={`${dur1}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values={`${conn.tech2.x}; ${conn.tech2.x + dx2}; ${conn.tech2.x - dx2}; ${conn.tech2.x}`}
              dur={`${dur2}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y2"
              values={`${conn.tech2.y}; ${conn.tech2.y - dy2}; ${conn.tech2.y + dy2}; ${conn.tech2.y}`}
              dur={`${dur2}s`}
              repeatCount="indefinite"
            />
          </line>
        );
      })}

      {/* Tech nodes (circles and labels) with floating animation */}
      {Object.values(categoryPositions).map(({ techs }, catIdx) =>
        techs.map((tech, techIdx) => {
          // deterministic pseudo-random values based on name to keep animations stable
          const seed = Math.abs(
            Array.from(tech.name).reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7)
          );
          const amp = 8 + (seed % 12); // amplitude between 8 and 19 px for more noticeable floating
          const dur = 4 + (seed % 6); // duration between 4s and 9s
          const dx = Math.round((seed % 3) - 1) * amp; // x offset
          const dy = Math.round((seed % 5) - 2) * amp; // y offset
          
          // Check if this tech matches the search query
          const isHighlighted = normalizedSearch.length > 0 && tech.name.toLowerCase().includes(normalizedSearch);
          const fillColor = isHighlighted ? "#bd1550" : "#000000"; // Initio primary color for highlight
          const strokeColor = isHighlighted ? "#bd1550" : "#000000";
          const textColor = isHighlighted ? "#bd1550" : "#000000";

          return (
            <g key={`tech-${catIdx}-${techIdx}`}>
              <circle 
                r="6" 
                fill={fillColor} 
                stroke={strokeColor}
                strokeWidth="2"
              >
                <animate
                  attributeName="cx"
                  values={`${tech.x}; ${tech.x + dx}; ${tech.x - dx}; ${tech.x}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`${tech.y}; ${tech.y - dy}; ${tech.y + dy}; ${tech.y}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <text
                textAnchor="middle"
                fontSize="11"
                fill={textColor}
                fontWeight={isHighlighted ? "700" : "400"}
                fontFamily="Open Sans, Helvetica, Arial, sans-serif"
              >
                {tech.name}
                <animate
                  attributeName="x"
                  values={`${tech.x}; ${tech.x + dx}; ${tech.x - dx}; ${tech.x}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y"
                  values={`${tech.y - 14}; ${tech.y - 14 - dy}; ${tech.y - 14 + dy}; ${tech.y - 14}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
              </text>
            </g>
          );
        })
      )}

      {/* Category labels removed — constellation now shows only nodes and connections */}
    </svg>
  );
}
