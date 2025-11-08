"use client";

import React, { useEffect, useState } from "react";
import { Mail, MapPin, Github, Linkedin, Send, RotateCcw, CheckCircle2 } from "lucide-react";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";



interface Info {
  description?: string;
  email?: string;
  facebook?: string;
  fullName?: string;
  github?: string;
  initialName?: string;
  instagram?: string;
  linkedin?: string;
  location?: string;
  portfolio?: string;
  techStacks?: string[];
}

export default function StylishContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regarding, setRegarding] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showMailtoConfirm, setShowMailtoConfirm] = useState(false);
  const [mailtoHref, setMailtoHref] = useState<string | null>(null);
  const [sendMethod, setSendMethod] = useState<string | null>(null); // 'server' | 'mailto'
  const [info, setInfo] = useState<Info | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

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
          // reset form after successful server send
          setName('');
          setEmail('');
          setRegarding('');
          setMessage('');
        } else {
          // fallback: prepare mailto and show confirmation modal so we can detect cancel
          const subject = encodeURIComponent(`Contact Form Submission - Regarding: ${regarding ?? 'General'}`);
          const body = encodeURIComponent(`My Name: ${name}\nMy Email Address: ${email}\nRegarding: ${regarding ?? 'General'}\n\nMessage:\n${message}`);
          const mailto = `mailto:pjramyanath@gmail.com?subject=${subject}&body=${body}`;
          setMailtoHref(mailto);
          setShowMailtoConfirm(true);
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
    setMessage("");
    setError(null);
    setSent(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: info?.email ?? "pjramyanath@gmail.com",
      href: `mailto:${info?.email ?? "pjramyanath@gmail.com"}`,
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: MapPin,
      label: "Location",
      value: info?.location ?? "Colombo, Sri Lanka",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: info?.linkedin ?? "pasan-ramyanath",
      href: info?.linkedin ? `https://www.linkedin.com/in/${info.linkedin}` : "https://www.linkedin.com/in/pasan-ramyanath/",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Github,
      label: "Github",
      value: info?.github ?? "PasanRamyanath",
      href: info?.github ? `https://github.com/${info.github}` : "https://github.com/PasanRamyanath",
      color: "from-gray-700 to-gray-900",
    },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadInfo() {
      setLoadingInfo(true);
      setInfoError(null);
      try {
        const snap = await getDocs(collection(db, "my-information"));
        if (!mounted) return;

        if (snap.empty) {
          setInfo(null);
        } else {
          const docData = snap.docs[0].data() as DocumentData;

          setInfo({
            description: docData.description,
            email: docData.email,
            facebook: docData.facebook,
            fullName: docData.fullName,
            github: docData.github,
            initialName: docData.initialName,
            instagram: docData.instagram,
            linkedin: docData.linkedin,
            location: docData.location,
            portfolio: docData.portfolio,
            techStacks: Array.isArray(docData.techStacks)
              ? docData.techStacks
              : docData.techStacks && typeof docData.techStacks === 'object'
              ? Object.values(docData.techStacks).flat()
              : [],
          });
        }
      } catch (err) {
        if (!mounted) return;
        setInfoError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoadingInfo(false);
      }
    }

    loadInfo();
    return () => {
      mounted = false;
    };
  }, []);

  return (
  <div className="min-h-screen static-bg">
      <main className="relative py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-5">
            <h1 className="text-5xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Let&apos;s Connect
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              I&apos;d love to hear about your project or opportunity. Reach out using the form below or via email / social links.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-6 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300">
                <h2 className="text-2xl font-bold text-slate-100 mb-3">Get in Touch</h2>
                <p className="text-slate-300 mb-6">
                  Available for freelance work, contract roles, and collaborations.
                  <span className="block mt-2 text-sm text-indigo-300 font-medium">Response time: 1-2 business days</span>
                </p>

                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl p-4 bg-slate-800/60 hover:shadow-lg transition-all duration-300 border border-white/10">
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      <div className="relative flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-300 mb-1">{item.label}</h3>
                          {item.href ? (
                            <a
                              href={item.href}
                              target={item.href.startsWith("http") ? "_blank" : undefined}
                              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                              className="text-sm text-indigo-300 hover:text-indigo-200 font-medium break-all group-hover:underline"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-300">{item.value}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Tech stacks</h3>
                  {loadingInfo ? (
                    <p className="text-sm text-slate-400">Loading...</p>
                  ) : infoError ? (
                    <p className="text-sm text-red-300">Failed to load tech stacks</p>
                  ) : info?.techStacks && info.techStacks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {info.techStacks.map((t, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-sm font-medium border border-indigo-800/40">{t}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No tech stacks listed.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">Send a Message</h2>
                  <p className="text-slate-300">Fill out the form below and it will open your mail client with the message prefilled.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-slate-900/40 text-slate-200 placeholder-slate-400 ${focusedField === "name" ? "border-indigo-500 shadow-lg shadow-indigo-900/30" : "border-slate-700 hover:border-slate-600"} focus:outline-none`}
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Your Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-slate-900/40 text-slate-200 placeholder-slate-400 ${focusedField === "email" ? "border-indigo-500 shadow-lg shadow-indigo-900/30" : "border-slate-700 hover:border-slate-600"} focus:outline-none`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Regarding</label>
                    <input
                      type="text"
                      value={regarding}
                      onChange={(e) => setRegarding(e.target.value)}
                      onFocus={() => setFocusedField('regarding')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-slate-900/40 text-slate-200 placeholder-slate-400 ${focusedField === 'regarding' ? 'border-indigo-500 shadow-lg shadow-indigo-900/30' : 'border-slate-700 hover:border-slate-600'} focus:outline-none`}
                      placeholder="Project, job, collaboration..."
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Your Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-slate-900/40 text-slate-200 placeholder-slate-400 resize-none ${focusedField === "message" ? "border-indigo-500 shadow-lg shadow-indigo-900/30" : "border-slate-700 hover:border-slate-600"} focus:outline-none`}
                      placeholder="Tell me about your project, collaboration idea, or question..."
                    />
                  </div>

                  {error && <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-300 text-sm font-medium">{error}</div>}
                  {sent && !error && sendMethod === 'server' && (
                    <div className="flex items-center gap-2 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-xl text-emerald-300 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5" />Message sent — thank you!
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleSubmit} className="flex-1 group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <span className="relative z-10 flex items-center justify-center gap-2"><Send className="w-5 h-5" />Send Message</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    <button onClick={handleReset} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" />Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      {/* Mailto confirmation modal */}
      {showMailtoConfirm && mailtoHref && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowMailtoConfirm(false); setError('Email sending canceled by user.'); }} />
          <div className="relative bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Open your mail client?</h3>
            <p className="text-sm text-slate-300 mb-4">Your default mail application will open with the prepared message. If you cancel there, the message will not be sent.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  // Cancel - treat as discarded
                  setShowMailtoConfirm(false);
                  setError('Email sending canceled by user.');
                }}
                className="px-4 py-2 rounded-md bg-slate-800 text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Open mail client (best-effort). Do not show a sent/opening banner.
                  window.location.href = mailtoHref;
                  // reset form fields as requested
                  setName('');
                  setEmail('');
                  setRegarding('');
                  setMessage('');
                  setShowMailtoConfirm(false);
                }}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white"
              >
                Open Mail Client
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
