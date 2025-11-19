"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';

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
  // direction: 1 = forward (next), -1 = backward (prev)
  const [direction, setDirection] = useState<number>(0);
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
  const prev = () => {
    setDirection(-1);
    setSelected((s) => (s - 1 + cleaned.length) % cleaned.length);
  };
  const next = () => {
    setDirection(1);
    setSelected((s) => (s + 1) % cleaned.length);
  };

  const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

  const handleThumbnailClick = (idx: number) => {
    // determine direction for animation
    setDirection(idx > selected ? 1 : idx < selected ? -1 : 0);
    setSelected(idx);
    if (emblaApi) emblaApi.scrollTo(idx);
  };
  const openViewer = () => {}; // noop kept for compatibility

  // Embla carousel for thumbnails (smooth, no native scrollbar)
  const [emblaRef, emblaApi] = useEmblaCarousel({ containScroll: 'trimSnaps', align: 'center' });

  useEffect(() => {
    if (!emblaApi) return;
    // Scroll the carousel so the selected slide is centered in the viewport
    try {
      emblaApi.scrollTo(selected);
    } catch (e) {
      // ignore scroll errors
    }
  }, [selected, emblaApi]);

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

  const renderThumbnail = (url: string, idx: number, small = false) => {
    const isActive = idx === selected;
    const isVid = isVideo(url);
    
    return (
      <motion.button
        key={idx}
        onClick={() => handleThumbnailClick(idx)}
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 group w-full ${
          isActive 
            ? "ring-3 ring-[#bd1550] shadow-xl shadow-[#bd1550]/30" 
            : "ring-1 ring-gray-200 hover:ring-2 hover:ring-[#bd1550]/50 hover:shadow-lg"
        }`}
        style={{ aspectRatio: small ? '1/1' : '4/3' }}
        aria-label={`Select media ${idx + 1}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: idx * 0.05 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Thumbnail content */}
        <div className={`w-full ${small ? 'h-16 sm:h-20' : 'h-full'}`}>
          {isVid ? (
            <video src={url} className="w-full h-full object-cover" preload="metadata" muted playsInline />
          ) : (
            <div className={`relative w-full h-full bg-gray-100`}> 
              <Image
                src={url}
                alt={`${title}-${idx}`}
                fill
                style={{ objectFit: "cover" }}
                sizes={small ? undefined : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"}
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

  // Variants for sliding carousel effect. Use `custom` to pass direction.
  const slideVariants = {
    enter: (dir: number) => ({ x: 50 * dir, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: -50 * dir, opacity: 0 }),
  };

  return (
    <div>
      {/* Unified layout: choose vertical or horizontal */}
      {!vertical && (
        <>
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200" style={{ height: `${mediaHeight}px` }}>
            {/* Show only the selected media and use AnimatePresence (mode=wait) to
                fade out the previous item before fading in the new one. This
                provides a smooth crossfade when switching previews. */}
              {/* Render only the selected media (no carousel/crossfade) */}
              {(() => {
                const url = cleaned[selected];
                if (!url) return null;
                if (isVideo(url)) {
                  return (
                    <video
                      key={url}
                      src={url}
                      preload="metadata"
                      className="absolute inset-0 bg-black"
                      style={{ width: "100%", height: `${mediaHeight}px`, objectFit: "contain" }}
                      controls
                      muted
                      playsInline
                    />
                  );
                }

                return (
                  <div key={url} className="absolute inset-0 w-full h-full flex items-center justify-center bg-white">
                    <Image src={url} alt={title} fill style={{ objectFit: "contain" }} />
                  </div>
                );
              })()}
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
              {/* Embla thumbnail strip (single horizontal row, no native scrollbar visible) */}
              <div className="embla overflow-hidden">
                <div className="embla__viewport" ref={emblaRef as unknown as (el: HTMLElement | null) => void}>
                  <div className="embla__container flex gap-2 py-2 px-1">
                    {(() => {
                      const thumbCount = Math.min(15, cleaned.length);
                      const percent = `${100 / thumbCount}%`;
                      return cleaned.slice(0, thumbCount).map((m, idx) => (
                        <div key={idx} className="embla__slide flex-shrink-0" style={{ width: percent }}>
                          {renderThumbnail(m, idx, true)}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Progress dots below the strip (for the visible thumbnails) */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {(() => {
                  const thumbCount = Math.min(15, cleaned.length);
                  return Array.from({ length: thumbCount }).map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => { setSelected(idx); emblaApi?.scrollTo(idx); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === selected 
                          ? "w-8 bg-[#bd1550]" 
                          : "w-1.5 bg-gray-300 hover:bg-[#bd1550]/50"
                      }`}
                      aria-label={`Go to media ${idx + 1}`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ));
                })()}
              </div>
            </motion.div>
          )}
        </>
      )}

      {vertical && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_96px] gap-4 items-start">
          <div className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200" style={{ height: `${mediaHeight}px` }}>
            {/* Vertical preview: render only selected media (no slide/carousel) */}
            {(() => {
              const url = cleaned[selected];
              if (!url) return null;
              if (isVideo(url)) {
                return (
                  <video
                    key={url}
                    src={url}
                    preload="metadata"
                    className="absolute inset-0 bg-black"
                    style={{ width: "100%", height: `${mediaHeight}px`, objectFit: "contain" }}
                    controls
                    muted
                    playsInline
                  />
                );
              }

              return (
                <div key={url} className="absolute inset-0 w-full h-full flex items-center justify-center bg-white">
                  <Image src={url} alt={title} fill style={{ objectFit: "contain" }} />
                </div>
              );
            })()}
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
