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
}

interface Props {
  certs: Cert[];
}

export default function CertGridClient({ certs }: Props) {
  const [selected, setSelected] = useState<Cert | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certs.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="bg-white rounded-lg shadow p-6 flex flex-col items-start text-left hover:shadow-lg transition"
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
            <h3 className="text-lg font-semibold">{c.cert_name ?? "Certification"}</h3>
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
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-4">
                <button
                  ref={closeBtnRef}
                  onClick={() => setSelected(null)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  aria-label="Close certificate dialog"
                >
                  Close
                </button>
              </div>

              <div className="px-6 pb-8">
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

                <h2 className="text-2xl font-bold mb-2">{selected.cert_name ?? "Certification"}</h2>
                {selected.issuer && <p className="text-sm text-gray-500 mb-4">{selected.issuer}</p>}

                {selected.description && (
                  <div className="prose max-w-none text-gray-700 mb-4">{selected.description}</div>
                )}

                <div className="flex gap-3 mt-4">
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
