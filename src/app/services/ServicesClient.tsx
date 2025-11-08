"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    <main className="min-h-screen static-bg py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Services</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            I help teams and founders ship quality web products. Below are some of the services I offer — if
            you don&apos;t see exactly what you need, reach out and we&apos;ll craft a custom plan.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Loading services…</div>
        ) : error ? (
          <div className="text-center text-rose-400">{error}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <article
                key={s.id}
                className="rounded-2xl p-6 bg-slate-800/40 backdrop-blur-md border border-white/10 shadow-md hover:shadow-xl transition-all"
              >
                <h2 className="text-lg font-semibold text-slate-100 mb-2">{s.title}</h2>
                <p className="text-sm text-slate-300 mb-4">{s.description}</p>
                <Link
                  href="/contact"
                  className="inline-block mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Discuss project
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-slate-300">Prefer a custom engagement or hourly consulting? <Link href="/contact" className="text-blue-400 font-semibold">Contact me</Link>.</p>
        </div>
      </div>
    </main>
  );
}
