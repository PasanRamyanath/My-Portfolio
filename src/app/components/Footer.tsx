import useSiteInfo from "@/lib/useSiteInfo";

export default function Footer() {
  const { info } = useSiteInfo();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    { name: "GitHub", href: info?.github ? `https://${info.github}` : "https://github.com/yourusername" },
    { name: "LinkedIn", href: info?.linkedin ? `https://${info.linkedin}` : "https://linkedin.com/in/yourprofile" },
    { name: "Twitter", href: "https://twitter.com/yourusername" },
  ];

  return (
    <>
      <footer id="footer" className="initio-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-0">
            {/* Brand Section */}
            <div>
              <h3 className="widget-title text-[0.9375rem]">Contact</h3>
              <div className="widget-body text-sm">
                <p>
                  <a href={info?.email ? `mailto:${info.email}` : "mailto:you@example.com"}>
                    {info?.email ?? "you@example.com"}
                  </a>
                </p>
              </div>
            </div>

            {/* Follow me */}
            <div>
              <h3 className="widget-title">Follow me</h3>
              <div className="widget-body text-sm">
                <p className="follow-me-icons text-[30px] flex gap-4">
                  {socialLinks.map((link) => (
                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                      {/* simple text links to keep light footprint */}
                      <span className="text-[#ccc] hover:text-white text-base align-middle">{link.name}</span>
                    </a>
                  ))}
                </p>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="widget-title">About</h3>
              <div className="widget-body text-sm text-[#999]">
                <p>
                  {info?.description ?? "Full Stack Developer passionate about creating beautiful and functional web experiences."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <footer id="underfooter" className="initio-underfooter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[12px] text-[#777]">
              © {currentYear} {info?.displayName ?? info?.initialName ?? "Your Name"}
            </p>
            <p className="text-[12px] text-right">
              Design inspired by <a href="http://www.gettemplate.com" rel="noreferrer" target="_blank">Initio</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}