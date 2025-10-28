import Link from "next/link";

export default function Services() {
  const services = [
    {
      id: "web-dev",
      title: "Web Development",
      desc: "Full-stack web applications using Next.js, React, TypeScript, and Node.js. From prototypes to production-ready apps.",
    },
    {
      id: "ui-ux",
      title: "UI / UX Design",
      desc: "Designing delightful and accessible interfaces with a strong focus on usability and brand consistency.",
    },
    {
      id: "perf",
      title: "Performance Optimization",
      desc: "Improve page speed, Core Web Vitals, and runtime performance through profiling and targeted fixes.",
    },
    {
      id: "consulting",
      title: "Technical Consulting",
      desc: "Architectural reviews, migration planning (e.g., monolith -> microfrontends), and mentoring engineering teams.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white/1 to-white/0 static-bg py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Services</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            I help teams and founders ship quality web products. Below are some of the services I offer — if
            you don&apos;t see exactly what you need, reach out and we&apos;ll craft a custom plan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl p-6 bg-white/30 backdrop-blur-md border border-white/10 shadow-md hover:shadow-xl transition-all"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-700 mb-4">{s.desc}</p>
              <Link
                href="/contact"
                className="inline-block mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Discuss project
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">Prefer a custom engagement or hourly consulting? <Link href="/contact" className="text-blue-600 font-semibold">Contact me</Link>.</p>
        </div>
      </div>
    </main>
  );
}
