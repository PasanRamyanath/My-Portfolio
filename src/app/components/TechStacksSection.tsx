"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import useSiteInfo from "@/lib/useSiteInfo";
import React from "react";

export default function TechStacksSection() {
  const { info, loading } = useSiteInfo();
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Build categorized stacks: prefer info.techStacksByCategory, else fallback to flat array under General
  // Each item can be a string or { name, image?, fileId? }
  const categorized: Record<string, Array<{ name: string; image?: string; fileId?: string }>> = React.useMemo(() => {
    function normalizeItem(item: any): { name: string; image?: string; fileId?: string } {
      if (typeof item === "string") return { name: item };
      if (item && typeof item === "object" && typeof item.name === "string") {
        return { name: item.name, image: item.image, fileId: item.fileId };
      }
      return { name: String(item) };
    }
    if (info?.techStacksByCategory && Object.keys(info.techStacksByCategory).length > 0) {
      const filtered: Record<string, Array<{ name: string; image?: string; fileId?: string }>> = {};
      for (const [k, v] of Object.entries(info.techStacksByCategory)) {
        if (Array.isArray(v) && v.length > 0) filtered[k] = v.map(normalizeItem);
      }
      return filtered;
    }
    if (info?.techStacks && info.techStacks.length > 0) {
      return { General: info.techStacks.map(normalizeItem) };
    }
    return {};
  }, [info]);

  const categoryEntries = Object.entries(categorized).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <section id="stack" className="relative min-h-screen py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center pt-4 md:pt-12">
        <div className="text-center mb-8 relative">
          <h2 className="initio-section-title">
            <span>Technical Skills</span>
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
            <div className="text-[#7C7C7C]">Loading tech skills...</div>
          </div>
        ) : categoryEntries.length === 0 ? (
          <div className="text-center text-[#7C7C7C]">No tech skills added yet.</div>
        ) : (
          <div className="flex justify-center w-full">
            <TechConstellation categories={categorized} searchQuery={searchQuery} />
          </div>
        )}
      </div>
    </section>
  );
}

type TechItem = { name: string; image?: string; fileId?: string };

function TechCategoryCard({ category, items }: { category: string; items: TechItem[] }) {
  return (
    <div className="group relative w-[240px] sm:w-[260px] h-56 rounded-2xl bg-slate-900/40 bg-clip-padding backdrop-blur-xl border border-white/10 ring-1 ring-white/5 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-400/40">
      <div className="mb-5 text-center flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600/70 to-purple-600/70 flex items-center justify-center shadow-md shadow-indigo-900/30">
          <span className="text-sm font-semibold text-white">{category.charAt(0)}</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-100 tracking-wide">{category}</h3>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((tech, idx) => (
          <span
            key={tech.name + idx}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-indigo-950/40 text-indigo-200 border border-indigo-800/50 shadow-sm shadow-indigo-900/20 hover:border-indigo-500/70 hover:text-indigo-100 transition-colors flex items-center gap-1"
          >
            {tech.image && (
              <img
                src={tech.image}
                alt={tech.name}
                className="w-4 h-4 rounded-sm mr-1 inline-block"
                style={{ objectFit: "contain" }}
                loading="lazy"
              />
            )}
            {tech.name}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl" />
    </div>
  );
}

function TechConstellation({ categories, searchQuery }: { categories: Record<string, TechItem[]>; searchQuery: string }) {
  // Use viewport-based sizing so animated nodes don't leave the visible area.
  const [svgSize, setSvgSize] = React.useState(() => ({ width: 900, height: 300 }));

  React.useEffect(() => {
    function computeSize() {
      const vw = window.innerWidth || 900;
      const vh = window.innerHeight || 800;
      // Keep reasonable min/max bounds so layout remains usable across devices
      const width = Math.max(600, Math.min(vw - 80, 1200));
      const height = Math.max(220, Math.min(Math.round(vh * 0.45), 700));
      setSvgSize({ width, height });
    }
    computeSize();
    window.addEventListener("resize", computeSize);
    return () => window.removeEventListener("resize", computeSize);
  }, []);

  const width = svgSize.width;
  const height = svgSize.height; // responsive height based on viewport
  const centerX = width / 2;
  const centerY = height / 2;
  const categoryRadius = Math.max(80, Math.round(Math.min(width, height) * 0.12)); // scale with viewport

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
      techs: {
        name: string;
        image?: string;
        fileId?: string;
        x: number;
        y: number;
        seed: number;
        amp: number;
        dur: number;
        dx: number;
        dy: number;
      }[];
    }
  > = {};

  // Lay out categories horizontally across the SVG so different types are spaced
  // evenly. Enforce a responsive left/right padding and a minimum gap between
  // category centers so constellations don't crowd each other or the edges.
  const basePadding = Math.max(80, Math.round(width * 0.06));
  const minGap = Math.max(120, Math.round(width * 0.12));
  let effectivePadding = basePadding;
  let availableInner = Math.max(0, width - effectivePadding * 2);

  // Determine spacing between category centers: try to use equal spacing
  // but guarantee at least `minGap` between them. If there's not enough room,
  // reduce padding to make room while preserving a minimal outer margin.
  let spacing = 0;
  let startX = effectivePadding;
  if (totalCategories > 1) {
    spacing = Math.max(minGap, Math.floor(availableInner / (totalCategories - 1)));
    // Prevent two-category layouts from stretching to the edges by capping spacing
    // relative to availableInner. This keeps the pair centered with margins.
    let maxSpacing = Math.floor(availableInner * 0.6);
    if (totalCategories === 2) maxSpacing = Math.floor(availableInner * 0.5);
    spacing = Math.min(spacing, Math.max(minGap, maxSpacing));

    let totalSpan = spacing * (totalCategories - 1);
    if (totalSpan > availableInner) {
      // Reduce padding to fit the required spacing
      effectivePadding = Math.max(16, Math.floor((width - totalSpan) / 2));
      availableInner = Math.max(0, width - effectivePadding * 2);
      spacing = Math.max(minGap, Math.floor(availableInner / (totalCategories - 1)));
      // Re-apply cap after recomputing availableInner
      maxSpacing = Math.floor(availableInner * 0.6);
      if (totalCategories === 2) maxSpacing = Math.floor(availableInner * 0.5);
      spacing = Math.min(spacing, Math.max(minGap, maxSpacing));
      totalSpan = spacing * (totalCategories - 1);
    }
    // Center the group of category centers within the SVG while keeping at least effectivePadding
    startX = Math.floor((width - totalSpan) / 2);
  }

  categoryEntries.forEach(([category, items], index) => {
    const catX = totalCategories > 1 ? startX + index * spacing : centerX;
    const catY = centerY; // keep them vertically centered

    // Position techs in a larger cluster around the category center
    // techRadius scales with viewport so items don't overlap or leave the SVG
    const techRadius = Math.max(40, Math.round(Math.min(width, height) * 0.08));
    const techs = items.map((tech, i) => {
      const techAngle = (i / items.length) * 2 * Math.PI;
      const techX = catX + techRadius * Math.cos(techAngle);
      const techY = catY + techRadius * Math.sin(techAngle);
      // Unique seed per tech for animation
      let seed = Math.abs(Array.from(tech.name).reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) + i * 101);
      if (seed === 0) seed = 1;
      const amp = 8 + (seed % 12);
      // Use a fixed duration so all tech nodes animate at the same speed
      const dur = 6; // seconds
      let dx = Math.round((seed % 3) - 1) * amp;
      let dy = Math.round((seed % 5) - 2) * amp;
      // Ensure we don't end up with both dx and dy as 0 (no movement)
      if (dx === 0 && dy === 0) {
        dx = amp;
        dy = amp / 2;
      }
      return { name: tech.name, image: tech.image, fileId: tech.fileId, x: techX, y: techY, seed, amp, dur, dx, dy };
    });

    categoryPositions[category] = { x: catX, y: catY, techs };
  });

  // Create lines connecting all techs within the same category (animated)
  const animatedConnections = Object.values(categoryPositions).map(({ techs }) => {
    const connections: Array<{
      tech1: typeof techs[0];
      tech2: typeof techs[0];
    }> = [];
    for (let i = 0; i < techs.length; i++) {
      for (let j = i + 1; j < techs.length; j++) {
        connections.push({
          tech1: techs[i],
          tech2: techs[j]
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
      {animatedConnections.map((conn, i) => (
        <line
          key={`line-${i}`}
          stroke="#000000"
          strokeWidth="1"
          opacity="0.3"
          x1={conn.tech1.x}
          y1={conn.tech1.y}
          x2={conn.tech2.x}
          y2={conn.tech2.y}
        >
          <animate
            attributeName="x1"
            values={`${conn.tech1.x}; ${conn.tech1.x + conn.tech1.dx}; ${conn.tech1.x - conn.tech1.dx}; ${conn.tech1.x}`}
            dur={`${conn.tech1.dur}s`}
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y1"
            values={`${conn.tech1.y}; ${conn.tech1.y - conn.tech1.dy}; ${conn.tech1.y + conn.tech1.dy}; ${conn.tech1.y}`}
            dur={`${conn.tech1.dur}s`}
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values={`${conn.tech2.x}; ${conn.tech2.x + conn.tech2.dx}; ${conn.tech2.x - conn.tech2.dx}; ${conn.tech2.x}`}
            dur={`${conn.tech2.dur}s`}
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values={`${conn.tech2.y}; ${conn.tech2.y - conn.tech2.dy}; ${conn.tech2.y + conn.tech2.dy}; ${conn.tech2.y}`}
            dur={`${conn.tech2.dur}s`}
            begin="0s"
            repeatCount="indefinite"
          />
        </line>
      ))}

      {/* Tech nodes (circles and labels) with floating animation */}
      {Object.values(categoryPositions).map(({ techs }, catIdx) =>
        techs.map((tech, techIdx) => {
          // Check if this tech matches the search query
          const isHighlighted = normalizedSearch.length > 0 && tech.name.toLowerCase().includes(normalizedSearch);
          const fillColor = isHighlighted ? "#bd1550" : "#000000"; // Initio primary color for highlight
          const strokeColor = isHighlighted ? "#bd1550" : "#000000";
          const textColor = isHighlighted ? "#bd1550" : "#000000";

          return (
            <g key={`tech-${catIdx}-${techIdx}`}>
              {/* Highlight circle if searched */}
              {isHighlighted && (
                <circle
                  r="24"
                  stroke="#bd1550"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.7"
                >
                  <animate
                    attributeName="cx"
                    values={`${tech.x}; ${tech.x + tech.dx}; ${tech.x - tech.dx}; ${tech.x}`}
                    dur={`${tech.dur}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`${tech.y}; ${tech.y - tech.dy}; ${tech.y + tech.dy}; ${tech.y}`}
                    dur={`${tech.dur}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {tech.image ? (
                <image
                  href={tech.image}
                  x={tech.x - 18}
                  y={tech.y - 18}
                  width="36"
                  height="36"
                  style={{ pointerEvents: "none" }}
                >
                  <animate
                    attributeName="x"
                    values={`${tech.x - 18}; ${tech.x - 18 + tech.dx}; ${tech.x - 18 - tech.dx}; ${tech.x - 18}`}
                    dur={`${tech.dur}s`}
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y"
                    values={`${tech.y - 18}; ${tech.y - 18 - tech.dy}; ${tech.y - 18 + tech.dy}; ${tech.y - 18}`}
                    dur={`${tech.dur}s`}
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </image>
              ) : (
                <circle
                  r="6"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  cx={tech.x}
                  cy={tech.y}
                >
                  <animate
                    attributeName="cx"
                    values={`${tech.x}; ${tech.x + tech.dx}; ${tech.x - tech.dx}; ${tech.x}`}
                    dur={`${tech.dur}s`}
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`${tech.y}; ${tech.y - tech.dy}; ${tech.y + tech.dy}; ${tech.y}`}
                    dur={`${tech.dur}s`}
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <text
                textAnchor="middle"
                fontSize="11"
                fill={textColor}
                fontWeight={isHighlighted ? "700" : "400"}
                fontFamily="Open Sans, Helvetica, Arial, sans-serif"
                x={tech.x}
                y={tech.y - 28}
              >
                {tech.name}
                <animate
                  attributeName="x"
                  values={`${tech.x}; ${tech.x + tech.dx}; ${tech.x - tech.dx}; ${tech.x}`}
                  dur={`${tech.dur}s`}
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y"
                  values={`${tech.y - 28}; ${tech.y - 28 - tech.dy}; ${tech.y - 28 + tech.dy}; ${tech.y - 28}`}
                  dur={`${tech.dur}s`}
                  begin="0s"
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
