"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import useSiteInfo from "@/lib/useSiteInfo";

export default function SocialsSection() {
  const { info } = useSiteInfo();

  const socials = [
    { name: 'Email', url: info?.email ? `mailto:${info.email}` : 'mailto:your.email@example.com', icon: '📧' },
    { name: 'LinkedIn', url: info?.linkedin ? `https://${info.linkedin}` : 'https://linkedin.com/in/yourprofile', icon: '💼' },
    { name: 'GitHub', url: info?.github ? `https://${info.github}` : 'https://github.com/yourusername', icon: '🐙' },
    { name: 'Twitter', url: (info as any)?.twitter ? `https://${(info as any).twitter}` : 'https://twitter.com/yourusername', icon: '🐦' },
    { name: 'Instagram', url: info?.instagram ? `https://${info.instagram}` : 'https://instagram.com/yourusername', icon: '📸' },
    { name: 'Medium', url: (info as any)?.medium ? `https://${(info as any).medium}` : 'https://medium.com/@yourusername', icon: '✍️' },
    { name: 'YouTube', url: (info as any)?.youtube ? `https://${(info as any).youtube}` : 'https://youtube.com/@yourusername', icon: '▶️' },
  ];

  return (
    <section id="socials" className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center gap-4">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/60 text-xl text-slate-100 hover:bg-slate-700 transition"
            >
              <span aria-hidden>{s.icon}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
