import { useRef, useState } from "react";

import { faqs } from "../../content/landingContent";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section className="faq-section snap-section" id="faq">
      <div className="faq-heading reveal">
        <p className="kicker">
          <span className="kicker-rule" /> Good questions
        </p>
        <h2>
          Before you
          <br />
          <em>open the book.</em>
        </h2>
        <p>
          Still curious? Write to{" "}
          <a href="mailto:hello@sermonprep.co">hello@sermonprep.co</a>.
        </p>
      </div>
      <div className="faq-list reveal">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={faq.question}>
              <button
                aria-expanded={isOpen}
                data-cursor
                onClick={() => setOpenFaq(isOpen ? -1 : index)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{faq.question}</strong>
                <i>{isOpen ? "−" : "+"}</i>
              </button>
              <div className={`faq-answer ${isOpen ? "is-open" : ""}`}>
                <div className="faq-answer-inner">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
