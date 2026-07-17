import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { testimonials } from "../../content/landingContent";

const testimonialIntervalMs = 6200;

export function TestimonialsSection() {
  const reduceMotion = Boolean(useReducedMotion());
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentTestimonial = testimonials[testimonialIndex];

  useEffect(() => {
    if (reduceMotion || isPaused) return;
    const timer = window.setInterval(
      () => setTestimonialIndex((current) => (current + 1) % testimonials.length),
      testimonialIntervalMs,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion, isPaused]);

  function moveTestimonial(direction: number) {
    setIsPaused(true);
    setTestimonialIndex(
      (current) => (current + direction + testimonials.length) % testimonials.length,
    );
  }

  return (
    <section className="quote-section snap-section" aria-labelledby="testimonial-heading">
      <div className="quote-panel reveal">
        <div className="quote-mark">“</div>
        <div className="quote-content">
          <p className="kicker light" id="testimonial-heading">
            <span className="kicker-rule" /> From the study
          </p>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={currentTestimonial.quote}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: reduceMotion ? 0 : 0.45 }}
            >
              {currentTestimonial.quote}
            </motion.blockquote>
          </AnimatePresence>
          <div className="quote-person">
            <span className={`avatar ${currentTestimonial.tone}`}>
              {currentTestimonial.initials}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentTestimonial.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <strong>{currentTestimonial.name}</strong>
                <small>{currentTestimonial.role}</small>
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="quote-controls">
            <div className="quote-progress">
              <span
                style={{
                  width: `${((testimonialIndex + 1) / testimonials.length) * 100}%`,
                }}
              />
            </div>
            <button
              aria-label={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
              data-cursor
              onClick={() => setIsPaused(!isPaused)}
            >
              <span>{isPaused ? "▶" : "❚❚"}</span>
            </button>
            <button
              aria-label="Previous testimonial"
              data-cursor
              onClick={() => moveTestimonial(-1)}
            >
              <span>←</span>
            </button>
            <button
              aria-label="Next testimonial"
              data-cursor
              onClick={() => moveTestimonial(1)}
            >
              <span>→</span>
            </button>
          </div>
        </div>
        <div className={`quote-art ${currentTestimonial.tone}`} aria-hidden="true">
          <div className="quote-art-ring" />
          <div className="quote-art-cross">✦</div>
          <span>
            Words
            <br />
            that
            <br />
            <em>hold.</em>
          </span>
        </div>
      </div>
      <div className="testimonial-caption">
        <span>
          {String(testimonialIndex + 1).padStart(2, "0")} /{" "}
          {String(testimonials.length).padStart(2, "0")}
        </span>
        <span>Trusted by pastors, teachers, and thoughtful readers.</span>
        <span>Since 2024</span>
      </div>
    </section>
  );
}
