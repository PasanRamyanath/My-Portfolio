"use client";

import { useState } from "react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
      
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      value: "your.email@example.com",
      link: "mailto:your.email@example.com",
    },
    {
      icon: "💼",
      title: "LinkedIn",
      value: "linkedin.com/in/yourprofile",
      link: "https://linkedin.com/in/yourprofile",
    },
    {
      icon: "💻",
      title: "GitHub",
      value: "github.com/yourusername",
      link: "https://github.com/yourusername",
    },
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have a project in mind or want to collaborate? Feel free to reach
            out. I'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              <p className="text-gray-600 mb-8">
                Feel free to reach out through any of these channels. I typically
                respond within 24 hours.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info) => (
                <a
                  key={info.title}
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="text-3xl">{info.icon}</div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {info.title}
                    </p>
                    <p className="text-gray-900 group-hover:text-blue-600 transition-colors">
                      {info.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="pt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Follow Me
              </h4>
              <div className="flex gap-4">
                {["Twitter", "Instagram", "Medium"].map((platform) => (
                  <a
                    key={platform}
                    href={`https://${platform.toLowerCase()}.com/yourusername`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold hover:shadow-lg transform hover:scale-110 transition-all"
                  >
                    {platform[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                  placeholder="Tell me about your project..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {submitStatus === "success" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
                  ✓ Message sent successfully! I'll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}