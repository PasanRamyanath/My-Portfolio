"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface Cert {
  id: string;
  cert_name?: string;
  issuer?: string;
  description?: string;
  linkedin?: string;
  image?: string;
  type?: "university" | "external";
}

interface Props {
  certs: Cert[];
}

export default function CertGridClient({ certs }: Props) {
  const [selected, setSelected] = useState<Cert | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [filterType, setFilterType] = useState<"all" | "university" | "external">("all");

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus trap for modal
  useEffect(() => {
    if (!selected) return;
    closeBtnRef.current?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [selected]);

  return (
    <>
      <div className="mb-6 flex justify-center">
        <div className="flex gap-3">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
              filterType === "all"
                ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                : "bg-slate-800/60 text-slate-200 border-slate-700 hover:shadow-sm"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("university")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
              filterType === "university"
                ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                : "bg-slate-800/60 text-slate-200 border-slate-700 hover:shadow-sm"
            }`}
          >
            University
          </button>
          <button
            onClick={() => setFilterType("external")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
              filterType === "external"
                ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                : "bg-slate-800/60 text-slate-200 border-slate-700 hover:shadow-sm"
            }`}
          >
            External
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certs
          .filter((c) => (filterType === "all" ? true : (c.type ?? "university") === filterType))
          .sort((a, b) => {
            // external certificates should appear first
            const ta = a.type ?? "university";
            const tb = b.type ?? "university";
            if (ta === tb) return 0;
            if (ta === "external") return -1;
            if (tb === "external") return 1;
            return 0;
          })
          .map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
              className="rounded-lg p-6 flex flex-col items-start text-left transition shadow-lg border border-white/20 bg-white/30 backdrop-blur-md hover:bg-white/40 hover:shadow-xl"
          >
            {c.image && (
              <div className="w-full h-40 mb-4 overflow-hidden rounded relative">
                <Image
                  src={c.image}
                  alt={c.cert_name ?? c.issuer ?? "certificate"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
            )}
            <div className="flex items-center gap-3 w-full justify-between">
              <h3 className="text-lg font-semibold">{c.cert_name ?? "Certification"}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/6">{((c.type ?? "university").charAt(0).toUpperCase() + (c.type ?? "university").slice(1))}</span>
            </div>
            {c.issuer && <p className="text-sm text-gray-500">{c.issuer}</p>}
          </button>
        ))}
      </div>

      {selected &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selected.cert_name ?? "Certificate dialog"}
          >
            <div
              ref={modalRef}
              className="rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl border border-white/20 bg-white/40 backdrop-blur-md glass-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
            <style jsx>{`
              .glass-scrollbar::-webkit-scrollbar {
                width: 12px;
                background: transparent;
              }
              .glass-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 8px;
                border: 2px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(4px);
              }
              .glass-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
            `}</style>
              <div className="flex justify-end p-4">
                <button
                  ref={closeBtnRef}
                  onClick={() => setSelected(null)}
                  className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
                  aria-label="Close certificate dialog"
                >
                  Close
                </button>
              </div>

              <div className="px-6 pb-8 text-center">
                {selected.image && (
                  <div className="w-full mb-6 flex justify-center relative h-[70vh]">
                    <Image
                      src={selected.image}
                      alt={selected.cert_name ?? selected.issuer ?? "certificate"}
                      fill
                      className="object-contain rounded"
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    />
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-2 text-slate-100 text-center">{selected.cert_name ?? "Certification"}</h2>
                {selected.issuer && <p className="text-sm text-slate-300 mb-4 text-center">{selected.issuer}</p>}

                {selected.description && (
                  <div className="prose mx-auto max-w-prose text-slate-200 mb-4 text-center">{selected.description}</div>
                )}

                <div className="flex gap-3 mt-4 justify-center">
                  {selected.linkedin && (
                    <a
                      href={selected.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      View on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
