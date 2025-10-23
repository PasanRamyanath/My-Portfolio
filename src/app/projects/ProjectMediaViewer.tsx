"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  media: string[];
  title?: string;
}

export default function ProjectMediaViewer({ media, title }: Props) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  if (!media || media.length === 0) return null;

  const prev = () => setSelected((s) => (s - 1 + media.length) % media.length);
  const next = () => setSelected((s) => (s + 1) % media.length);

  return (
    <div>
      <div className="w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {media[selected]?.endsWith?.('.mp4') || media[selected]?.endsWith?.('.webm') ? (
          <video src={media[selected]} className="w-full h-80 sm:h-96 md:h-[420px] lg:h-[520px] object-contain bg-white" controls onClick={() => setOpen(true)} />
        ) : (
          <img src={media[selected]} alt={title} className="w-full h-80 sm:h-96 md:h-[420px] lg:h-[520px] object-contain bg-white cursor-pointer" onClick={() => setOpen(true)} />
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {media.map((m, idx) => (
            <button key={idx} onClick={() => setSelected(idx)} className={`w-full h-28 bg-gray-100 rounded overflow-hidden ${idx === selected ? 'ring-2 ring-blue-500' : ''}`}>
              {m?.endsWith?.('.mp4') || m?.endsWith?.('.webm') ? (
                <video src={m} className="w-full h-full object-cover" />
              ) : (
                <img src={m} alt={`${title}-${idx}`} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <button onClick={() => setOpen(false)} className="absolute top-2 right-2 z-20 bg-white/90 rounded-full px-3 py-1">Close</button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 z-20 bg-white/90 rounded-full px-3 py-1">◀</button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 z-20 bg-white/90 rounded-full px-3 py-1">▶</button>

            <div className="bg-white rounded shadow-lg overflow-hidden">
              <div className="p-4 flex items-center justify-center">
                {media[selected]?.endsWith?.('.mp4') || media[selected]?.endsWith?.('.webm') ? (
                  <video src={media[selected]} className="w-full max-h-[80vh] object-contain" controls autoPlay />
                ) : (
                  <img src={media[selected]} alt={title} className="w-full max-h-[80vh] object-contain" />
                )}
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
