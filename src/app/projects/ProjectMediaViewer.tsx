"use client";

import React, { useState, MouseEvent } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface Props {
  media: string[];
  title?: string;
}

export default function ProjectMediaViewer({ media, title = "Media" }: Props) {
  const [selected, setSelected] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  if (!media || media.length === 0) return null;

  const prev = () => setSelected((s) => (s - 1 + media.length) % media.length);
  const next = () => setSelected((s) => (s + 1) % media.length);

  const isVideo = (url: string) => url.endsWith(".mp4") || url.endsWith(".webm");

  const handleThumbnailClick = (idx: number) => setSelected(idx);
  const handleVideoClick = () => setOpen(true);
  const handleImgClick = () => setOpen(true);
  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  return (
    <div>
      <div className="w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {isVideo(media[selected]) ? (
          <video
            src={media[selected]}
            className="w-full h-80 sm:h-96 md:h-[420px] lg:h-[520px] object-contain bg-white"
            controls
            onClick={handleVideoClick}
          />
        ) : (
          <div className="relative w-full h-80 sm:h-96 md:h-[420px] lg:h-[520px] bg-white cursor-pointer" onClick={handleImgClick}>
            <Image
              src={media[selected]}
              alt={title}
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {media.map((m, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`w-full h-28 bg-gray-100 rounded overflow-hidden ${idx === selected ? "ring-2 ring-blue-500" : ""}`}
            >
              {isVideo(m) ? (
                <video src={m} className="w-full h-full object-cover" />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={m}
                    alt={`${title}-${idx}`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {open && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative max-w-5xl w-full max-h-[90vh]">
              <button onClick={() => setOpen(false)} className="absolute top-2 right-2 z-20 bg-white/90 rounded-full px-3 py-1">Close</button>
              <button onClick={stopPropagation} className="absolute left-2 top-1/2 z-20 bg-white/90 rounded-full px-3 py-1" onClickCapture={prev}>◀</button>
              <button onClick={stopPropagation} className="absolute right-2 top-1/2 z-20 bg-white/90 rounded-full px-3 py-1" onClickCapture={next}>▶</button>

              <div className="bg-white rounded shadow-lg overflow-hidden">
                <div className="p-4 flex items-center justify-center">
                  {isVideo(media[selected]) ? (
                    <video src={media[selected]} className="w-full max-h-[80vh] object-contain" controls autoPlay />
                  ) : (
                    <div className="relative w-full max-h-[80vh] h-[80vh]">
                      <Image src={media[selected]} alt={title} fill style={{ objectFit: "contain" }} />
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
