"use client";

import React, { useState, MouseEvent } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

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
  const [open, setOpen] = useState<boolean>(false);

  // Clean media array (remove empty strings / undefined)
  const cleaned = (media || []).filter((m) => typeof m === "string" && m.trim().length > 0) as string[];
  if (!cleaned || cleaned.length === 0) return null;

  const prev = () => setSelected((s) => (s - 1 + cleaned.length) % cleaned.length);
  const next = () => setSelected((s) => (s + 1) % cleaned.length);

  const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

  const handleThumbnailClick = (idx: number) => setSelected(idx);
  const openViewer = () => setOpen(true);
  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  const renderPreview = (url: string, sizeClasses = "h-80 sm:h-96 md:h-[420px] lg:h-[520px]") =>
    isVideo(url) ? (
      <video
        src={url}
        className={`w-full ${sizeClasses} object-contain bg-white`}
        controls
        onClick={openViewer}
      />
    ) : (
      <div
        className={`relative w-full ${sizeClasses} bg-white cursor-pointer`}
        onClick={openViewer}
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
      </div>
    );

  const renderThumbnail = (url: string, idx: number, thumbClasses = "w-40 h-24 flex-shrink-0") => (
    <button
      key={idx}
      onClick={() => handleThumbnailClick(idx)}
      className={`${thumbClasses} rounded overflow-hidden transition ring-offset-1 ${idx === selected ? "ring-2 ring-blue-500" : "bg-gray-100 hover:bg-gray-200"}`}
      aria-label={`Select media ${idx + 1}`}
    >
      {isVideo(url) ? (
        <video src={url} className="w-full h-full object-cover" />
      ) : (
        <div className="relative w-full h-full">
          <Image
            src={url}
            alt={`${title}-${idx}`}
            fill
            style={{ objectFit: "cover" }}
            sizes="160px"
          />
        </div>
      )}
    </button>
  );

  return (
    <div>
      {/* Unified layout: choose vertical or horizontal */}
      {!vertical && (
        <>
          <div className="w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            {renderPreview(cleaned[selected])}
          </div>
          {cleaned.length > 1 && (
            <div className="mt-4">
              <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                {cleaned.map((m, idx) => renderThumbnail(m, idx))}
              </div>
            </div>
          )}
        </>
      )}

      {vertical && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_96px] gap-4 items-start">
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            {renderPreview(cleaned[selected])}
          </div>
          {cleaned.length > 1 && (
            <div className="hidden md:flex flex-col gap-3">
              {cleaned.map((m, idx) => renderThumbnail(m, idx, "w-24 h-20") )}
            </div>
          )}
        </div>
      )}

      {open && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
            <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={stopPropagation}>
              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                aria-label="Close media viewer"
                className="absolute top-3 right-3 z-60 w-10 h-10 rounded-full p-0 flex items-center justify-center shadow-2xl backdrop-blur-md bg-gradient-to-br from-red-600/85 to-red-500/80 text-white border border-red-400/20 ring-1 ring-red-500/10 hover:from-red-700 hover:to-red-600 transition-all"
              >
                <span className="text-lg leading-none">✕</span>
              </button>

              {/* Prev / Next */}
              {cleaned.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    aria-label="Previous media"
                    className="absolute left-3 top-1/2 z-60 -translate-y-1/2 bg-slate-900/70 text-white rounded-full p-3 shadow-lg hover:bg-slate-800/90 transition-colors"
                  >
                    ◀
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    aria-label="Next media"
                    className="absolute right-3 top-1/2 z-60 -translate-y-1/2 bg-slate-900/70 text-white rounded-full p-3 shadow-lg hover:bg-slate-800/90 transition-colors"
                  >
                    ▶
                  </button>
                </>
              )}

              <div className="bg-white rounded shadow-lg overflow-hidden">
                <div className="p-4 flex items-center justify-center">
                  {isVideo(cleaned[selected]) ? (
                    <video src={cleaned[selected]} className="w-full max-h-[80vh] object-contain" controls autoPlay />
                  ) : (
                    <div className="relative w-full max-h-[80vh] h-[80vh]">
                      <Image src={cleaned[selected]} alt={title} fill style={{ objectFit: "contain" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}
