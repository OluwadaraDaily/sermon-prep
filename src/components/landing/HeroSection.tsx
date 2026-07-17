import { motion } from "framer-motion";
import type { RefObject } from "react";
import { Link } from "react-router-dom";

import { ArrowIcon, CheckIcon, LockIcon, SparkIcon } from "../common/Icons";

interface HeroSectionProps {
  reduceMotion: boolean;
  visualRef: RefObject<HTMLDivElement | null>;
}

export function HeroSection({ reduceMotion, visualRef }: HeroSectionProps) {
  return (
    <section className="hero snap-section">
      <div className="hero-copy">
        <p className="kicker">
          <span className="kicker-rule" /> A quieter way to study
        </p>
        <h1>
          Find the thread between your <em>notes</em> and Scripture.
        </h1>
        <p className="hero-lede">
          Sermon Prep helps pastors, preachers, and Bible teachers surface every relevant
          passage in the moment it matters — while the thought is still warm.
        </p>
        <div className="hero-actions">
          <Link className="button button-dark magnetic" data-cursor to="/workspace">
            Try the workspace <ArrowIcon />
          </Link>
          <a className="text-link" data-cursor href="#demo">
            See how it works <span>↓</span>
          </a>
        </div>
        <div className="hero-note">
          <span className="hero-note-mark">✦</span>
          <span>
            <strong>Built for the study desk.</strong> No noise. No detours.
          </span>
        </div>
      </div>

      <div className="hero-visual" ref={visualRef} id="demo">
        <div className="visual-arch" aria-hidden="true" />
        <div className="visual-stamp" aria-hidden="true">
          SP
          <br />
          <small>EST. 2024</small>
        </div>
        <div className="demo-window" aria-label="Sermon Prep product preview">
          <div className="window-bar">
            <div className="window-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="window-title">sermon-prep / workspace</span>
            <span className="window-status">
              <i /> local & private
            </span>
          </div>
          <div className="demo-content">
            <div className="demo-notes">
              <div className="demo-label">
                <span>01</span> Reading notes
              </div>
              <p className="demo-note-heading">
                The shape of a
                <br />
                <em>steady hope</em>
              </p>
              <p className="demo-note-copy">
                Hope is not a vague feeling. It has a memory — and a direction. The
                prophets kept returning to the idea that...
              </p>
              <div className="demo-note-line" />
              <p className="demo-note-fade">...we are held, even here.</p>
              <div className="demo-finding">
                <SparkIcon /> <span>4 references found</span>
              </div>
            </div>
            <div className="demo-results">
              <div className="demo-label">
                <span>02</span> Scripture threads
              </div>
              <motion.div
                className="demo-result result-gold"
                animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="result-top">
                  <span>Romans 5:3–5</span>
                  <CheckIcon />
                </div>
                <p>
                  “Not only this, but we also rejoice in our sufferings, knowing that
                  suffering produces perseverance; and perseverance, proven character;
                  and proven character, hope; and hope doesn’t disappoint us, because
                  God’s love has been poured into our hearts through the Holy Spirit who
                  was given to us.”
                </p>
                <small>hope · perseverance</small>
              </motion.div>
              <motion.div
                className="demo-result result-rose"
                animate={reduceMotion ? undefined : { y: [0, 3, 0] }}
                transition={{
                  duration: 4.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              >
                <div className="result-top">
                  <span>Psalm 42:5</span>
                  <CheckIcon />
                </div>
                <p>
                  “Why are you in despair, my soul? Why are you disturbed within me? Hope
                  in God! For I shall still praise him for the saving help of his
                  presence.”
                </p>
                <small>longing · trust</small>
              </motion.div>
              <div className="demo-more">
                + 2 more passages <ArrowIcon />
              </div>
            </div>
          </div>
          <div className="demo-footer">
            <span>
              <LockIcon /> Your notes stay on your device
            </span>
            <span>WEB translation</span>
          </div>
        </div>
        <div className="floating-note note-top">
          <span className="note-scribble">✣</span>
          <span>
            Context-aware
            <br />
            <strong>suggestions</strong>
          </span>
        </div>
        <div className="floating-note note-bottom">
          <span className="note-number">02</span>
          <span>
            From note
            <br />
            <strong>to passage</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
