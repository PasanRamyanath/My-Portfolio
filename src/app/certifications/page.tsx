import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Metadata } from "next";
import CertGridClient from "./CertGridClient";

export const metadata: Metadata = {
  title: "Certifications — Pasan Ramyanath",
  description: "Professional certifications and courses completed.",
};

interface Cert {
  id: string;
  cert_name?: string;
  issuer?: string;
  description?: string;
  linkedin?: string;
  image?: string;
}

export default async function CertificationsPage() {
  const snapshot = await getDocs(collection(db, "certifications"));
  const certs: Cert[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

  return (
    <main className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-gray-600 mt-2">Selected professional certifications and course badges.</p>
        </div>

        {certs.length === 0 ? (
          <div className="text-center text-gray-500">No certifications found.</div>
        ) : (
          <CertGridClient certs={certs} />
        )}
      </div>
    </main>
  );
}
