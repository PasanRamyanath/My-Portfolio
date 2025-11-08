import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SiteInfo {
  description?: string;
  displayName?: string;
  email?: string;
  facebook?: string;
  fullName?: string;
  github?: string;
  initialName?: string;
  instagram?: string;
  linkedin?: string;
  location?: string;
  passions?: string[];
  portfolio?: string;
  techStacks?: string[];
}

let cachedInfo: SiteInfo | null = null;
let fetchInProgress: Promise<SiteInfo | null> | null = null;

async function fetchSiteInfoOnce(): Promise<SiteInfo | null> {
  if (cachedInfo) return cachedInfo;
  if (fetchInProgress) return fetchInProgress;

  fetchInProgress = (async () => {
    try {
      const snap = await getDocs(collection(db, "my-information"));
      if (snap.empty) return null;
      const data = snap.docs[0].data() as Record<string, unknown>;
      const info: SiteInfo = {
        description: typeof data.description === "string" ? data.description : undefined,
        displayName: typeof data.displayName === "string" ? data.displayName : undefined,
        email: typeof data.email === "string" ? data.email : undefined,
        facebook: typeof data.facebook === "string" ? data.facebook : undefined,
        fullName: typeof data.fullName === "string" ? data.fullName : undefined,
        github: typeof data.github === "string" ? data.github : undefined,
        initialName: typeof data.initialName === "string" ? data.initialName : undefined,
        instagram: typeof data.instagram === "string" ? data.instagram : undefined,
        linkedin: typeof data.linkedin === "string" ? data.linkedin : undefined,
        location: typeof data.location === "string" ? data.location : undefined,
        passions: Array.isArray(data.passions) ? (data.passions as string[]) : [],
        portfolio: typeof data.portfolio === "string" ? data.portfolio : undefined,
        techStacks: Array.isArray(data.techStacks) ? (data.techStacks as string[]) : [],
      };
      cachedInfo = info;
      return info;
    } catch (err) {
      console.warn("Failed to fetch site info", err);
      return null;
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
}

export default function useSiteInfo() {
  const [info, setInfo] = useState<SiteInfo | null>(cachedInfo);
  const [loading, setLoading] = useState(!cachedInfo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (cachedInfo) {
      setInfo(cachedInfo);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchSiteInfoOnce()
      .then((data) => {
        if (!mounted) return;
        setInfo(data);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { info, loading, error } as const;
}
