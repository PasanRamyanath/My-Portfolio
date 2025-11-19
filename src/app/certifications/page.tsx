import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Metadata } from "next";
import CertGridClient from "./CertGridClient";

export const metadata: Metadata = {
  title: "Certifications - Pasan Ramyanath",
  description: "Professional certifications and courses completed.",
};

interface Cert {
  id: string;
  cert_name?: string;
  issuer?: string;
  description?: string;
  linkedin?: string;
  image?: string;
  type?: "university" | "external";
}

// Strongly typed Firestore document
function mapCertDoc(doc: QueryDocumentSnapshot<DocumentData>): Cert {
  const data = doc.data();
  return {
    id: doc.id,
    cert_name: typeof data.cert_name === "string" ? data.cert_name : undefined,
    issuer: typeof data.issuer === "string" ? data.issuer : undefined,
    description: typeof data.description === "string" ? data.description : undefined,
    linkedin: typeof data.linkedin === "string" ? data.linkedin : undefined,
    image: typeof data.image === "string" ? data.image : undefined,
    // support legacy 'academic' value by mapping it to 'university'
    type: typeof data.type === "string"
      ? (data.type === "academic" ? "university" : (data.type as "university" | "external"))
      : undefined,
  };
}

export default async function CertificationsPage() {
  const snapshot = await getDocs(collection(db, "certifications"));
  const certs: Cert[] = snapshot.docs.map(mapCertDoc);

  return (
    <main className="relative min-h-screen overflow-hidden py-10" style={{ background: "#fff" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="initio-section-title"><span>Certifications</span></h1>
          <p className="text-[#7C7C7C] text-base max-w-2xl mx-auto">
            Selected professional certifications and course badges.
          </p>
        </div>

        {certs.length === 0 ? (
          <div className="text-center text-[#a5a5a5]">No certifications found.</div>
        ) : (
          <CertGridClient certs={certs} />
        )}
      </div>
    </main>
  );
}
