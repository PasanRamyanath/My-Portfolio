"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function BackButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-black hover:opacity-80 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}
