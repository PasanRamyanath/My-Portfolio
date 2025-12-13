"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import useSiteInfo from "@/lib/useSiteInfo";

interface NavbarProps {
  deferUntilScroll?: boolean; // when true (home page), start below hero and stick when scrolled
}

export default function Navbar({ deferUntilScroll = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { info } = useSiteInfo();
  const navRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [pendingScrollToSocials, setPendingScrollToSocials] = useState(false);
  // Start with a very large threshold so we don't accidentally mark as scrolled
  // before we measure the navbar position on mount.
  const [threshold, setThreshold] = useState<number>(Number.POSITIVE_INFINITY);

  useEffect(() => {
    // Measure navbar position after mount. Use offsetTop per request but run
    // measurement after a short delay and on resize/load to ensure layout is ready.
    const measure = () => {
      const navEl = navRef.current;
      if (navEl && deferUntilScroll) {
        // Use the top offset of the nav (its position in the flow) plus a small buffer
        // so the nav will stick once the user scrolls past it.
        setThreshold(navEl.offsetTop + 8);
      } else {
        setThreshold(20);
      }
    };

    // run after a short delay to allow layout to settle (images/fonts)
    const t = window.setTimeout(measure, 50);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [deferUntilScroll]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (deferUntilScroll) {
        setScrolled(y >= threshold);
      } else {
        setScrolled(y > 20);
      }
    };
    window.addEventListener("scroll", handleScroll);
    // run once to set initial state (after threshold measured)
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [deferUntilScroll, threshold]);

  // When user clicked Contact from another page we set `pendingScrollToSocials`.
  // Wait for pathname to become `/` then try to scroll to the section. Use a retry
  // loop in case the DOM isn't hydrated immediately.
  useEffect(() => {
    if (!pendingScrollToSocials) return;
    if (pathname !== "/") return;

    let attempts = 0;
    const maxAttempts = 80; // ~8s
    const interval = setInterval(() => {
      attempts += 1;
      const el = document.getElementById("socials");
      if (el) {
        const navOffset = 64;
        const y = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        clearInterval(interval);
        setPendingScrollToSocials(false);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPendingScrollToSocials(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pendingScrollToSocials, pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Services", href: "/services" },
    { name: "Certifications", href: "/certifications" },
    { name: "Contact", href: "#socials" },
  ];

  // Smooth scroll handler for Home and Contact
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "#socials") {
      e.preventDefault();
      if (pathname === "/") {
        // Already on homepage, scroll directly
        const el = document.getElementById("socials") ;
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset + 30; // 100px offset for navbar
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      } else {
        // Navigate to homepage and set a pending flag so a useEffect can
        // wait for the pathname to become '/' and then scroll reliably.
        // mark intent in sessionStorage so the homepage can honour it after navigation
        try { sessionStorage.setItem('scrollToSocials', '1'); } catch (e) {}
        setPendingScrollToSocials(true);
        router.push("/");
      }
      setMobileMenuOpen(false);
    } else if (href === "/") {
      // Only intercept if already on the homepage
      if (pathname === "/") {
        e.preventDefault();
        // If there's a #home section, scroll to it, else scroll to top
        const homeEl = document.getElementById("home");
        if (homeEl) {
          const y = homeEl.getBoundingClientRect().top + window.pageYOffset + 500;
          window.scrollTo({ top: y, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`${deferUntilScroll ? "sticky top-0" : "fixed top-0 left-0 right-0"} z-50 transition-all duration-300 border-y ${
          scrolled ? "bg-white/85 backdrop-blur-sm border-[#cccccc]" : "bg-white border-[#cccccc]"
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="relative flex items-center justify-between min-h-[64px]">
          {/* Logo */}
          <Link
            href="/"
            className="md:hidden text-2xl font-bold text-[#333] hover:opacity-90 transition-opacity"
          >
            {info?.displayName ?? info?.initialName ?? "Portfolio"}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex w-full items-center justify-center">
            {navLinks.map((link) => (
              link.name === "Contact" || link.name === "Home" ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={e => handleNavClick(e, link.href)}
                  className="text-[#454545] hover:text-black transition-colors font-light uppercase tracking-wide px-8 py-5 inline-block cursor-pointer"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#454545] hover:text-black transition-colors font-light uppercase tracking-wide px-8 py-5 inline-block"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-gray-700 transition-all ${
                  mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-gray-700 transition-all ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-gray-700 transition-all ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - overlay so it doesn't shift content */}
      <div
        className={`md:hidden transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } absolute left-0 right-0 top-16 z-40`}
      >
        <div className="px-4 py-2 bg-white shadow-sm border-t border-[#cccccc]">
          {navLinks.map((link) => (
            link.name === "Contact" || link.name === "Home" ? (
              <a
                key={link.name}
                href={link.href}
                onClick={e => handleNavClick(e, link.href)}
                className="block py-4 text-[#454545] hover:text-black transition-colors font-light uppercase tracking-wide cursor-pointer"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-4 text-[#454545] hover:text-black transition-colors font-light uppercase tracking-wide"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>
      </div>
      </nav>
      {/* Spacer to avoid layout jump when navbar becomes fixed */}
      {deferUntilScroll && scrolled && <div style={{ height: 64 }} />}
    </>
  );
}