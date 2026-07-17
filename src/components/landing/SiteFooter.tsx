import { Brand } from "../common/Brand";
import { ArrowIcon } from "../common/Icons";
import { Link } from "react-router-dom";

export function SiteFooter() {
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
          <form onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input id="newsletter-email" placeholder="Your email address" type="email" />
            <button aria-label="Subscribe to newsletter" data-cursor type="submit">
              <ArrowIcon />
            </button>
          </form>
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
