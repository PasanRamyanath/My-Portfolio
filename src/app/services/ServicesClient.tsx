"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Service {
  id?: string;
  title: string;
  description: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDiscussClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      sessionStorage.setItem("scrollToSocials", "1");
    } catch (err) {
      // ignore
    }
    router.push("/");
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const col = collection(db, "services");
        const snap = await getDocs(col);
        const items: Service[] = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as Service) }));
        if (!mounted) return;
        setServices(items);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Failed to load services");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden py-10" style={{ background: "#fff" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="initio-section-title"><span>Services</span></h1>
          <p className="text-[#7C7C7C] text-base max-w-2xl mx-auto">
            I help teams and founders ship quality web products. Below are some of the services I offer — if
            you don&apos;t see exactly what you need, reach out and we&apos;ll craft a custom plan.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-[#a5a5a5]">Loading services…</div>
        ) : error ? (
          <div className="text-center text-[#bd1550]">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s) => (
              <article
                  key={s.id}
                  className="rounded-none p-6 bg-[#f3f3f3] border border-[#e1e1e1] shadow-[0_0_0_1px_#e1e1e1,0_0_0_3px_#fff,0_0_0_4px_#e1e1e1] hover:shadow-none transition-all flex flex-col h-full"
                >
                <h2 className="text-lg font-bold text-[#333] mb-2 uppercase tracking-wide">{s.title}</h2>
                <p className="text-sm text-[#666] mb-4">{s.description}</p>
                <a
                  href="/"
                  onClick={handleDiscussClick}
                  className="mt-auto w-full flex items-center justify-center px-6 py-3 bg-[#bd1550] text-white font-bold text-xs uppercase tracking-wide hover:bg-[#e61f65] transition-colors"
                  role="button"
                >
                  <span style={{ color: 'white' }}>Discuss project</span>
                </a>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[#7C7C7C]">Prefer a custom engagement or hourly consulting? <a href="/" onClick={handleDiscussClick} className="text-[var(--initio-primary)] font-semibold">Contact me</a>.</p>
        </div>
      </div>
    </main>
  );
}
