"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mail, MapPin, Send, RotateCcw, CheckCircle2,Phone } from "lucide-react";
import Image from "next/image";

interface Info {
  description?: string;
  email?: string;
  facebook?: string;
  fullName?: string;
  github?: string;
  phone?: string;
  huggingFace?: string;
  initialName?: string;
  instagram?: string;
  linkedin?: string;
  location?: string;
  portfolio?: string;
  techStacks?: any;
}

export default function SocialsSection() {
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regarding, setRegarding] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  // Mailto fallback state no longer used (kept for compatibility but not shown)
  const [showMailtoConfirm, setShowMailtoConfirm] = useState(false);
  const [mailtoHref, setMailtoHref] = useState<string | null>(null);
  const [sendMethod, setSendMethod] = useState<string | null>(null); // 'server' | 'mailto'

  useEffect(() => {
    let mounted = true;

    async function loadInfo() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "my-information"));
        if (!mounted) return;

        if (snap.empty) {
          setInfo(null);
        } else {
          const docData = snap.docs[0].data();
          setInfo({
            description: docData.description,
            email: docData.email,
            phone: docData.phone,
            facebook: docData.facebook,
            fullName: docData.fullName,
            github: docData.github,
            huggingFace: docData.huggingFace,
            initialName: docData.initialName,
            instagram: docData.instagram,
            linkedin: docData.linkedin,
            location: docData.location,
            portfolio: docData.portfolio,
            techStacks: docData.techStacks,
          });
        }
      } catch (err) {
        console.error("Failed to load info:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInfo();
    return () => {
      mounted = false;
    };
  }, []);

  // If navigation from another page requested scrolling to socials, honour it here.
  useEffect(() => {
    // Run only after initial loading finished (so the section exists in the DOM)
    if (loading) return;

    let want = false;
    try {
      want = sessionStorage.getItem("scrollToSocials") === "1";
    } catch (e) {
      want = false;
    }
    const viaHash = typeof window !== "undefined" && window.location.hash === "#socials";
    if (!want && !viaHash) return;

    // clear the intent flag so repeat navigation won't re-trigger
    try {
      sessionStorage.removeItem("scrollToSocials");
    } catch (e) {}

    let attempts = 0;
    const maxAttempts = 80; // ~8s
    const interval = setInterval(() => {
      attempts += 1;
      const el = document.getElementById("socials");
      if (el) {
        const navOffset = 64; // match Navbar offset
        const y = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = () => {
    (async () => {
      setError(null);
      if (!name.trim() || !email.trim() || !message.trim() || !regarding.trim()) {
        setError("Please fill in all fields.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setSending(true);
      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, regarding, message }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSent(true);
          setError(null);
          setSendMethod('server');
          setName('');
          setEmail('');
          setRegarding('');
          setMessage('');
        } else {
            setError(data.error || 'Failed to send message via server.');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || 'Failed to send message');
      } finally {
        setSending(false);
      }
    })();
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setRegarding("");
    setMessage("");
    setError(null);
    setSent(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      // Initio shows phone, email, address stacked; prefer saved phone from Firebase
      value: info?.phone ?? "+94 00 0000000",
      href: undefined,
    },
    {
      icon: Mail,
      label: "Email",
      value: info?.email ?? "pjramyanath@gmail.com",
      href: `mailto:${info?.email ?? "pjramyanath@gmail.com"}`,
    },
    {
      icon: MapPin,
      label: "Address",
      value: info?.location ?? "Colombo, Sri Lanka",
      href: undefined,
    },
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      image: "/socials/linkedin.png",
      url: info?.linkedin ? `${info.linkedin}` : "https://www.linkedin.com/in/pasan-ramyanath/",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "GitHub",
      image: "/socials/Github.png",
      url: info?.github ? `${info.github}` : "https://github.com/PasanRamyanath",
      color: "from-gray-700 to-gray-900",
    },
    {
      name: "Hugging Face",
      image: "/socials/Huggingface.png",
      url: info?.huggingFace ?? "",
      color: "from-yellow-500 to-orange-500",
    },
    {
      name: "Instagram",
      image: "/socials/instagram.png",
      url: info?.instagram ? `${info.instagram}` : "https://instagram.com/",
      color: "from-pink-500 to-purple-500",
    },
    {
      name: "Facebook",
      image: "/socials/facebook.png",
      url: info?.facebook ? `${info.facebook}` : "https://facebook.com/",
      color: "from-blue-600 to-indigo-600",
    },
  ];

  if (loading) {
    return (
      <section id="socials" className="py-16 bg-[#232323] text-[#999]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-[#2b2b2b] rounded animate-pulse max-w-xs mb-4" />
          <div className="h-6 bg-[#2b2b2b] rounded animate-pulse max-w-md" />
        </div>
      </section>
    );
  }

  return (
    <section id="socials" className="py-16 bg-white text-[#999]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title (reuse global Initio style) */}
        <h2 className="initio-section-title mb-10 text-center"><span>Contact Me</span></h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left: Contact info + socials, like Initio footer widgets */}
          <div className="space-y-8 md:order-2 md:col-span-4">
            <div>
              <h3 className="text-[0.9375rem] uppercase text-[#ccc] mb-4">Contact</h3>
              <div className="text-sm leading-relaxed text-[#000]">
                {contactInfo.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <p key={idx} className="mb-1 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#bd1550]" />
                      <span className="font-semibold text-[#777] mr-1">{item.label}:</span>
                      {item.href ? (
                        <a href={item.href} className="text-[#ccc] hover:text-white underline-offset-2 hover:underline break-all">
                          {item.value}
                        </a>
                      ) : (
                        <span>{item.value}</span>
                      )}
                    </p>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[0.9375rem] uppercase text-[#ccc] mb-4">Follow me</h3>
              <p className="follow-me-icons text-[30px] flex flex-wrap items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                    aria-label={social.name}
                  >
                    <span className="inline-block w-[30px] h-[30px] relative">
                      <Image src={social.image} alt={social.name} fill className="object-contain" />
                    </span>
                  </a>
                ))}
              </p>
            </div>
          </div>

          {/* Right: Contact form, kept but visually simplified to fit Initio */}
          <div className="md:order-1 md:col-span-8">
            <h3 className="text-[0.9375rem] uppercase text-[#ccc] mb-4">Send a message</h3>
            <div className="bg-white border border-[#333] p-6 text-sm text-[#999]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-semibold text-[#ccc] mb-2 uppercase">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-3 py-2 border text-[#ccc] bg-[#f0f0f5] placeholder-[#666] text-xs  tracking-wide focus:outline-none ${
                      focusedField === "name" ? "border-[#bd1550]" : "border-[#333]"
                    }`}
                    placeholder="Kelum Sandaruwan"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-[#ccc] mb-2 uppercase">Your Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-3 py-2 border text-[#ccc] bg-[#f0f0f5] placeholder-[#666] text-xs  tracking-wide focus:outline-none ${
                      focusedField === "email" ? "border-[#bd1550]" : "border-[#333]"
                    }`}
                    placeholder="kelum@gmail.com"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-[#ccc] mb-2 uppercase">Regarding</label>
                <input
                  type="text"
                  value={regarding}
                  onChange={(e) => setRegarding(e.target.value)}
                  onFocus={() => setFocusedField('regarding')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-3 py-2 border text-[#ccc] bg-[#f0f0f5] placeholder-[#666] text-xs  tracking-wide focus:outline-none ${
                    focusedField === 'regarding' ? 'border-[#bd1550]' : 'border-[#333]'
                  }`}
                  placeholder="Project, job, collaboration..."
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-[#ccc] mb-2 uppercase">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  rows={6}
                  className={`w-full px-3 py-2 border text-[#ccc] bg-[#f0f0f5] placeholder-[#666]  text-xs tracking-wide resize-none focus:outline-none ${
                    focusedField === "message" ? "border-[#bd1550]" : "border-[#333]"
                  }`}
                  placeholder="Hello, I would like to discuss..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-[#3b000f] border border-[#bd1550] text-[#ffd5e4] text-xs font-medium">
                  {error}
                </div>
              )}
              {sent && !error && sendMethod === 'server' && (
                <div className="flex items-center gap-2 p-3 bg-[#003b1f] border border-[#1aa34a] text-[#b5ffcf] text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />Message sent — thank you!
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleSubmit} 
                  disabled={sending}
                  className="flex-1 px-6 py-3 bg-[#bd1550] text-white font-bold text-xs uppercase tracking-wide hover:bg-[#e61f65] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span style={{ color: 'white' }}>{sending ? 'Sending...' : 'Send Message'}</span>
                </button>

                <button 
                  onClick={handleReset} 
                  className="px-6 py-3 bg-transparent border border-[#000] text-[#444] font-bold text-xs uppercase tracking-wide hover:border-[#bd1550] hover:text-[#bd1550] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
        </div> 
      </div> 
    </section>
  );
}