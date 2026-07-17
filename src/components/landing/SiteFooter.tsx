import { useState, type FormEvent } from "react";

import { Brand } from "../common/Brand";
import { ArrowIcon } from "../common/Icons";
import { Link } from "react-router-dom";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setStatus("pending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Newsletter signup failed:", error);
      setStatus("error");
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Brand light />
          <p>Make room for the message.</p>
        </div>
        <div className="footer-newsletter">
          <p className="kicker light">
            <span className="kicker-rule" /> Notes from the margins
          </p>
          <h3>
            Occasional thoughts
            <br />
            <em>for the study.</em>
          </h3>
          {status === "success" ? (
            <p style={{ color: "#a8b5a8" }}>Thanks for subscribing!</p>
          ) : (
            <form onSubmit={handleNewsletterSubmit}>
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                type="email"
                value={email}
                disabled={status === "pending"}
              />
              <button
                aria-label="Subscribe to newsletter"
                data-cursor
                type="submit"
                disabled={status === "pending"}
              >
                <ArrowIcon />
              </button>
              {status === "error" && (
                <small style={{ color: "#e8a5a5", display: "block", marginTop: "0.5rem" }}>
                  Something went wrong. Please try again.
                </small>
              )}
            </form>
          )}
        </div>
        <div className="footer-links">
          <div>
            <span>Explore</span>
            <a data-cursor href="#features">
              Features
            </a>
            <a data-cursor href="#how-it-works">
              How it works
            </a>
            <Link data-cursor to="/workspace">
              Workspace
            </Link>
          </div>
          <div>
            <span>Say hello</span>
            <a data-cursor href="mailto:hello@sermonprep.co">
              Email us
            </a>
            <a data-cursor href="#early-access">
              Early access
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 Sermon Prep</span>
        <span>Made for the faithful & the still-learning.</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  );
}
