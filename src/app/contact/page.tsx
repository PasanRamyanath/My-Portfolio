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
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const subject = encodeURIComponent(`Message from ${name} via portfolio`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:pjramyanath@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    setSent(true);
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
            techStacks: Array.isArray(docData.techStacks) ? docData.techStacks : [],
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              I&apos;d love to hear about your project or opportunity. Reach out using the form below or via email / social links.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-6 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Get in Touch</h2>
                <p className="text-gray-600 mb-6">
                  Available for freelance work, contract roles, and collaborations.
                  <span className="block mt-2 text-sm text-indigo-600 font-medium">Response time: 1-2 business days</span>
                </p>

                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 border border-gray-100">
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      <div className="relative flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-700 mb-1">{item.label}</h3>
                          {item.href ? (
                            <a
                              href={item.href}
                              target={item.href.startsWith("http") ? "_blank" : undefined}
                              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium break-all group-hover:underline"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-600">{item.value}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Tech stacks</h3>
                  {loadingInfo ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : infoError ? (
                    <p className="text-sm text-red-600">Failed to load tech stacks</p>
                  ) : info?.techStacks && info.techStacks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {info.techStacks.map((t, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">{t}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tech stacks listed.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white/5 to-white/2 bg-clip-padding backdrop-blur-lg backdrop-saturate-150 rounded-2xl p-8 shadow-lg border border-white/10 ring-1 ring-white/5 hover:shadow-2xl hover:from-white/10 hover:to-white/5 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Send a Message</h2>
                  <p className="text-gray-600">Fill out the form below and it will open your mail client with the message prefilled.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm ${focusedField === "name" ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-gray-200 hover:border-gray-300"} focus:outline-none`}
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm ${focusedField === "email" ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-gray-200 hover:border-gray-300"} focus:outline-none`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none ${focusedField === "message" ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-gray-200 hover:border-gray-300"} focus:outline-none`}
                      placeholder="Tell me about your project, collaboration idea, or question..."
                    />
                  </div>

                  {error && <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>}
                  {sent && !error && <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium"><CheckCircle2 className="w-5 h-5" />Opening your mail client...</div>}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleSubmit} className="flex-1 group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <span className="relative z-10 flex items-center justify-center gap-2"><Send className="w-5 h-5" />Send Message</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    <button onClick={handleReset} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" />Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
