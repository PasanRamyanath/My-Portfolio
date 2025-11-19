"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSiteInfo from "@/lib/useSiteInfo";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const headRef = useRef<HTMLDivElement | null>(null);
  const { info, loading } = useSiteInfo();

  useEffect(() => setMounted(true), []);

  // Simple parallax effect similar to Initio's template.js
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const speed = 2; // matches parallax-speed="2"
    const onScroll = () => {
      const offset = -Math.floor(window.pageYOffset / speed);
      el.style.backgroundPosition = `center ${offset}px`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [headRef]);

  return (
    <>
      <header id="header" className="w-full">
        <div id="head" ref={headRef} className="parallax">
          <h1 id="logo" className="text-center">
            {loading ? (
              <div className="w-full flex flex-col items-center gap-4 animate-pulse" aria-live="polite">
                <div className="w-32 h-32 rounded-full bg-gray-200" />
                <div className="w-48 h-6 rounded bg-gray-200 mt-2" />
                <div className="w-64 h-4 rounded bg-gray-200 mt-1" />
                <div className="flex gap-4 mt-6">
                  <div className="w-36 h-10 rounded bg-gray-200" />
                  <div className="w-36 h-10 rounded bg-gray-200" />
                </div>
              </div>
            ) : (
              <>
                <img
                  className="img-circle mb-6"
                  src="/profile.jpeg"
                  alt={info?.displayName ?? info?.initialName ?? "Profile"}
                  onError={(e) => {
                    // fallback to original image if profile.jpeg is missing
                    (e.currentTarget as HTMLImageElement).src = "/images/guy.jpg";
                  }}
                />
                <span className="title block mt-4">{info?.displayName ?? info?.initialName ?? ""}</span>
                <span className="tagline block mt-2">
                  {info?.shortDescription ?? ""}
                  <br />
                  <a href={info?.email ? `mailto:${info.email}` : "mailto:pramyanath@gmail.com"}>
                    {info?.email ?? "pramyanath@gmail.com"}
                  </a>
                </span>
                <div className="flex gap-4 flex-wrap justify-center mx-auto mt-6 text-white">
                  <Link href="/projects" className="btn btn-primary inline-flex items-center gap-2 text-white">
                    <span className="text-white">See My Work</span>
                  </Link>

                  <a href="/I.M.P.J%20Ramyanath.pdf" download="Ramyanath_CV.pdf" className="btn btn-action inline-flex items-center gap-2">
                    <span>Download CV</span>
                  </a>
                </div>
              </>
            )}
          </h1>
        </div>
      </header>

    </>
  );
}
