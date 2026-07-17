import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Brand } from "../common/Brand";
import { ArrowIcon } from "../common/Icons";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <Brand />
      <nav className="nav-links" aria-label="Main navigation">
        <a data-cursor href="#features">
          Why Sermon Prep
        </a>
        <a data-cursor href="#how-it-works">
          How it works
        </a>
        <a data-cursor href="#faq">
          FAQ
        </a>
      </nav>
      <Link className="nav-cta" data-cursor to="/workspace">
        Open workspace <ArrowIcon />
      </Link>
    </header>
  );
}
