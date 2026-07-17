import { useState, type FormEvent } from "react";
import { Brand } from "../common/Brand";
import { ArrowIcon } from "../common/Icons";
import { Link } from "react-router-dom";

import { submitEmailSignup } from "./emailSignup";

type NewsletterStatus = "idle" | "pending" | "success" | "error";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || status === "pending") return;

    setStatus("pending");

    try {
      await submitEmailSignup("newsletter", trimmedEmail);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const newsletterMessage =
    status === "error"
      ? "We couldn’t subscribe you. Please try again."
      : status === "success"
        ? "You’re subscribed. We’ll write when there’s something worth sharing."
        : "";

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
          <form aria-describedby="newsletter-status" onSubmit={handleNewsletterSubmit}>
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Your email address"
              required
              disabled={status === "pending" || status === "success"}
              type="email"
              value={email}
            />
            <button
              aria-label="Subscribe to newsletter"
              data-cursor
              disabled={status === "pending" || status === "success"}
              type="submit"
            >
              <ArrowIcon />
            </button>
          </form>
          <p aria-live="polite" className="newsletter-status" id="newsletter-status">
            {status === "pending" ? "Subscribing…" : newsletterMessage ?? ""}
          </p>
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
