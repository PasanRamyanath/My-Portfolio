import useSiteInfo from "@/lib/useSiteInfo";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const { info } = useSiteInfo();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Services", href: "/services" },
    { name: "Certifications", href: "/certifications" },
    { name: "Contact", href: "/#socials" },
  ];

  const socialLinks = [
    info?.github && { name: "GitHub", href: info.github.startsWith('http') ? info.github : `https://github.com/${info.github}` },
    info?.linkedin && { name: "LinkedIn", href: info.linkedin.startsWith('http') ? info.linkedin : `https://linkedin.com/in/${info.linkedin}` },
    info?.facebook && { name: "Facebook", href: info.facebook.startsWith('http') ? info.facebook : `https://facebook.com/${info.facebook}` },
    info?.instagram && { name: "Instagram", href: info.instagram.startsWith('http') ? info.instagram : `https://instagram.com/${info.instagram}` },
    info?.huggingFace && { name: "Hugging Face", href: info.huggingFace.startsWith('http') ? info.huggingFace : `https://huggingface.co/${info.huggingFace}` },
  ].filter(Boolean) as { name: string; href: string }[];

  function getIconForName(name: string) {
    const key = name.toLowerCase();
    if (key.includes("github")) return "/footer/Github.png";
    if (key.includes("linkedin")) return "/footer/linkedin.png";
    if (key.includes("hugging")) return "/footer/Huggingface.png";
    if (key.includes("instagram")) return "/footer/instagram.png";
    if (key.includes("facebook")) return "/footer/facebook.png";
    return "/footer/Github.png";
  }

  return (
    <>
      <footer id="footer" className="initio-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-0">
            {/* Quick Links */}
            <div>
              <h3 className="widget-title text-[0.9375rem]">Quick Links</h3>
              <div className="widget-body text-sm">
                <ul className="space-y-2">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-[#ccc] hover:text-white transition-colors cursor-pointer">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="widget-title">Contact</h3>
              <div className="widget-body text-sm space-y-2">
                {info?.email ? (
                  <p>
                    <a href={`mailto:${info.email}`} className="text-[#ccc] hover:text-white transition-colors cursor-pointer" aria-label="Send email">
                      {info.email}
                    </a>
                  </p>
                ) : (
                  <p className="text-[#999]">No email provided</p>
                )}

                {info?.phone ? (
                  <p>
                    <a
                      href={`tel:${info.phone.replace(/\s+/g, "")}`}
                      className="text-[#ccc] hover:text-white transition-colors cursor-pointer"
                      aria-label="Call phone number"
                    >
                      {info.phone}
                    </a>
                  </p>
                ) : null}

                {info?.location && (
                  <p className="text-[#999]">{info.location}</p>
                )}
              </div>
            </div>

            {/* Follow me */}
            <div>
              <h3 className="widget-title">Follow me</h3>
              <div className="widget-body text-sm">
                {socialLinks.length > 0 ? (
                  <ul className="space-y-2">
                    {socialLinks.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-white hover:text-white transition-colors cursor-pointer"
                          aria-label={link.name}
                        >
                          <Image src={getIconForName(link.name)} alt={`${link.name} icon`} width={20} height={20} className="rounded-sm" />
                          <span className="text-sm text-[#ccc] font-medium">{link.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#ccc]">Connect with me on social media</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <footer id="underfooter" className="initio-underfooter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center">
            <span className="text-[12px] text-[#ccc] text-center">
              @ 2025 Developed by Pasan Ramyanath 
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}