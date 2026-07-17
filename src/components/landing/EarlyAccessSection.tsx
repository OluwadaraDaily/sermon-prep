import { motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";

import { ArrowIcon, CheckIcon } from "../common/Icons";

export function EarlyAccessSection() {
  const reduceMotion = Boolean(useReducedMotion());
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setJoined(true);
  }

  return (
    <section className="access-section snap-section" id="early-access">
      <div className="access-copy reveal">
        <p className="kicker">
          <span className="kicker-rule" /> Early access
        </p>
        <h2>
          A little more room
          <br />
          for <em>the Word.</em>
        </h2>
        <p>
          We are inviting a small first circle of pastors and teachers to help shape
          Sermon Prep. Bring your real study habits. We will bring the thoughtful details.
        </p>
        <div className="access-list">
          <span>
            <CheckIcon /> Free while in early access
          </span>
          <span>
            <CheckIcon /> No credit card required
          </span>
          <span>
            <CheckIcon /> Your feedback shapes the tool
          </span>
        </div>
      </div>
      <motion.div
        className="access-card reveal"
        whileHover={reduceMotion ? undefined : { y: -6 }}
      >
        <div className="access-card-top">
          <span className="access-badge">First circle</span>
          <span>Limited invitations</span>
        </div>
        <h3>
          Start with a
          <br />
          <em>clearer desk.</em>
        </h3>
        {joined ? (
          <div className="joined-message">
            <span>✦</span>
            <strong>You’re on the list.</strong>
            <p>We’ll be in touch when your study desk is ready.</p>
          </div>
        ) : (
          <form className="join-form" onSubmit={handleJoin}>
            <label htmlFor="early-access-email">Your email address</label>
            <div>
              <input
                id="early-access-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@church.org"
                required
                type="email"
                value={email}
              />
              <button className="button button-dark" data-cursor type="submit">
                Request an invite <ArrowIcon />
              </button>
            </div>
            <small>We’ll only send the good kind of email.</small>
          </form>
        )}
        <div className="access-card-foot">
          <span>
            <span className="online-dot" /> 34 thoughtful people joined this week
          </span>
        </div>
      </motion.div>
    </section>
  );
}
