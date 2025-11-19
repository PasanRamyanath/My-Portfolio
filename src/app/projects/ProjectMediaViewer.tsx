"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  media: string[];
  title?: string;
  /**
   * When true thumbnails are rendered vertically to the right of the main preview on md+ screens.
   */
  vertical?: boolean;
}

export default function ProjectMediaViewer({ media, title = "Media", vertical = false }: Props) {
  const [selected, setSelected] = useState<number>(0);
  const [mediaHeight, setMediaHeight] = useState<number>(420);

  useEffect(() => {
    function computeHeights() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let mh = 420;
      if (w >= 1600) mh = 700;
      else if (w >= 1400) mh = 620;
      else if (w >= 1200) mh = 560;
      else if (w >= 1024) mh = 520;
      else if (w >= 768) mh = 420;
      else if (w >= 480) mh = 340;
      else mh = 260;

      setMediaHeight(mh);
    }

    computeHeights();
    window.addEventListener("resize", computeHeights);
    return () => window.removeEventListener("resize", computeHeights);
  }, []);

  // Clean media array (remove empty strings / undefined)
  const cleaned = (media || []).filter((m) => typeof m === "string" && m.trim().length > 0) as string[];
  const prev = () => setSelected((s) => (s - 1 + cleaned.length) % cleaned.length);
  const next = () => setSelected((s) => (s + 1) % cleaned.length);

  const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

  const handleThumbnailClick = (idx: number) => setSelected(idx);
  const openViewer = () => {}; // noop kept for compatibility

  // Keyboard navigation: left/right arrows move between media
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cleaned.length]);

  if (!cleaned || cleaned.length === 0) return null;

  // Render preview with a consistent height computed from screen size
  const renderPreview = (url: string) =>
    isVideo(url) ? (
      <motion.video
        key={url}
        src={url}
        style={{ width: "100%", height: `${mediaHeight}px`, objectFit: "contain", background: "#fff" }}
        controls
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    ) : (
      <motion.div
        key={url}
        className={`relative w-full bg-white`}
        style={{ height: `${mediaHeight}px` }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={url}
          alt={title}
          fill
          style={{ objectFit: "contain" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.visibility = "hidden";
          }}
        />
      </motion.div>
    );

  const renderThumbnail = (url: string, idx: number) => {
    const isActive = idx === selected;
    const isVid = isVideo(url);
    
    return (
      <motion.button
        key={idx}
        onClick={() => handleThumbnailClick(idx)}
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 group aspect-[4/3] ${
          isActive 
            ? "ring-3 ring-[#bd1550] shadow-xl shadow-[#bd1550]/30" 
            : "ring-1 ring-gray-200 hover:ring-2 hover:ring-[#bd1550]/50 hover:shadow-lg"
        }`}
        aria-label={`Select media ${idx + 1}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: idx * 0.05 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Thumbnail content */}
        <div className="w-full h-full">
          {isVid ? (
            <video src={url} className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full bg-gray-100">
              <Image
                src={url}
                alt={`${title}-${idx}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
          )}
        </div>

        {/* Gradient overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 0.4 : 0 }}
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.2 }}
        />

        {/* Play icon for videos */}
        {isVid && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl backdrop-blur-sm">
              <svg className="w-6 h-6 text-[#bd1550] ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>
        )}

        {/* Active indicator - subtle glow effect */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 border-2 border-[#bd1550] rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div>
      {/* Unified layout: choose vertical or horizontal */}
      {!vertical && (
        <>
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200" style={{ height: `${mediaHeight}px` }}>
            {/* Layer all media and crossfade between them to avoid flashing */}
            {cleaned.map((url, idx) => {
              const visible = idx === selected;
              if (isVideo(url)) {
                return (
                  <motion.video
                    key={idx}
                    src={url}
                    preload="metadata"
                    // ensure video respects preview height and uses object-fit: contain
                    className="absolute inset-0 bg-black"
                    style={{ zIndex: visible ? 2 : 1, width: "100%", height: `${mediaHeight}px`, objectFit: "contain" }}
                    animate={{ opacity: visible ? 1 : 0 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    controls={visible}
                    autoPlay={visible}
                    muted
                    playsInline
                  />
                );
              }

              return (
                <motion.div
                  key={idx}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-white"
                  style={{ zIndex: visible ? 2 : 1 }}
                  animate={{ opacity: visible ? 1 : 0 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Image src={url} alt={title} fill style={{ objectFit: "contain" }} />
                </motion.div>
              );
            })}
            {cleaned.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Previous media"
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 bg-white/80 text-[#bd1550] rounded-full p-2 sm:p-3 shadow-lg hover:bg-white hover:text-[#e61f65] transition-all duration-200 font-bold text-lg"
                >
                  ◀
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Next media"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 bg-white/80 text-[#bd1550] rounded-full p-2 sm:p-3 shadow-lg hover:bg-white hover:text-[#e61f65] transition-all duration-200 font-bold text-lg"
                >
                  ▶
                </button>
              </>
            )}
          </div>
          {cleaned.length > 1 && (
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {cleaned.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setSelected(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === selected 
                        ? "w-8 bg-[#bd1550]" 
                        : "w-1.5 bg-gray-300 hover:bg-[#bd1550]/50"
                    }`}
                    aria-label={`Go to media ${idx + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
              
              {/* Responsive grid - no horizontal scroll */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {cleaned.map((m, idx) => renderThumbnail(m, idx))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {vertical && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_96px] gap-4 items-start">
          <div className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200" style={{ height: `${mediaHeight}px` }}>
            {/* Layered preview for vertical layout - crossfade to avoid flashes */}
            {cleaned.map((url, idx) => {
              const visible = idx === selected;
              if (isVideo(url)) {
                return (
                  <motion.video
                    key={idx}
                    src={url}
                    preload="metadata"
                    className="absolute inset-0 bg-black"
                    style={{ zIndex: visible ? 2 : 1, width: "100%", height: `${mediaHeight}px`, objectFit: "contain" }}
                    animate={{ opacity: visible ? 1 : 0 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    controls={visible}
                    autoPlay={visible}
                    muted
                    playsInline
                  />
                );
              }

              return (
                <motion.div
                  key={idx}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-white"
                  style={{ zIndex: visible ? 2 : 1 }}
                  animate={{ opacity: visible ? 1 : 0 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Image src={url} alt={title} fill style={{ objectFit: "contain" }} />
                </motion.div>
              );
            })}
            {cleaned.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Previous media"
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 bg-white/80 text-[#bd1550] rounded-full p-2 sm:p-3 shadow-lg hover:bg-white hover:text-[#e61f65] transition-all duration-200 font-bold text-lg"
                >
                  ◀
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Next media"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 bg-white/80 text-[#bd1550] rounded-full p-2 sm:p-3 shadow-lg hover:bg-white hover:text-[#e61f65] transition-all duration-200 font-bold text-lg"
                >
                  ▶
                </button>
              </>
            )}
          </div>
          {cleaned.length > 1 && (
            <motion.div 
              className="hidden md:grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {cleaned.map((m, idx) => renderThumbnail(m, idx))}
            </motion.div>
          )}
        </div>
      )}

      {/* popup/modal removed - previews now inline */}
    </div>
  );
}
