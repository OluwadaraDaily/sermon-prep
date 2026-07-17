import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import { buildPassagePdf, downloadPdf, type PdfExportMode } from "../core/export/pdf";
import { localWebProvider } from "../core/provider/localWebProvider";
import { parseBibleReferences, parseSingleBibleReference } from "../core/references/parser";

import type { BibleReference, Passage, ReferenceStatus } from "../core/bible/types";

const testimonials = [
  {
    quote:
      "Sermon Prep feels like having a thoughtful study partner beside me. It helps me notice the connections I was already reaching for.",
    name: "Rev. Miriam Okafor",
    role: "Lead pastor, New City Fellowship",
    initials: "MO",
    tone: "rose",
  },
  {
    quote:
      "The best part is how quiet it is. I can stay inside my notes and still find the passages that give the message its roots.",
    name: "Dr. Caleb Mensah",
    role: "Bible teacher & author",
    initials: "CM",
    tone: "sage",
  },
  {
    quote:
      "I used to lose the thread between research and writing. Now my references are gathered, checked, and ready when I am.",
    name: "Pastor Lydia James",
    role: "Teaching pastor, The Table Church",
    initials: "LJ",
    tone: "gold",
  },
];

const faqs = [
  {
    question: "What kinds of notes can I paste in?",
    answer:
      "Anything from a rough sermon outline to a paragraph of reading notes. Sermon Prep looks for recognizable Bible references such as John 3:16, Psalm 23, or 1 Corinthians 13:4–7 and brings them into one reviewable workspace.",
  },
  {
    question: "Does Sermon Prep replace my Bible study?",
    answer:
      "No. It is designed to support the work you are already doing, not shortcut it. You remain in control of the references, the context, and the final message; Sermon Prep simply makes the connective work easier to see.",
  },
  {
    question: "Can I export my passages for offline study?",
    answer:
      "Yes. Once your references are reviewed, you can export a clean PDF containing the reference list, the passage text, or both for your study binder and preaching notes.",
  },
  {
    question: "Which Bible translation is included?",
    answer:
      "The first workspace includes the World English Bible for local, distraction-free lookups. More translation options are planned as the early-access community helps shape the roadmap.",
  },
];

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<WorkspacePage />} path="/workspace" />
        <Route element={<LandingPage />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

function LandingPage() {
  const reduceMotion = useReducedMotion();
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [cursor, setCursor] = useState({ x: -100, y: -100, active: false });
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);
    const handleMouseMove = (event: MouseEvent) => setCursor((current) => ({ ...current, x: event.clientX, y: event.clientY }));
    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      setCursor((current) => ({ ...current, active: Boolean(target.closest("[data-cursor]")) }));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            duration: 0.85,
            delay: (index % 3) * 0.06,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 86%", toggleActions: "play none none reverse" },
          },
        );
      });

      if (heroVisualRef.current) {
        gsap.to(heroVisualRef.current, {
          y: 50,
          ease: "none",
          scrollTrigger: { trigger: heroVisualRef.current, start: "top top", end: "bottom top", scrub: true },
        });
      }
    });

    return () => context.revert();
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setTestimonialIndex((current) => (current + 1) % testimonials.length), 6200);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const currentTestimonial = testimonials[testimonialIndex];

  function moveTestimonial(direction: number) {
    setTestimonialIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setJoined(true);
  }

  return (
    <div className="site-shell">
      <div className={`custom-cursor ${cursor.active ? "is-active" : ""}`} style={{ left: cursor.x, top: cursor.y }} />

      <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
        <Link className="brand" data-cursor to="/">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <i />
          </span>
          <span>Sermon Prep</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <a data-cursor href="#features">Why Sermon Prep</a>
          <a data-cursor href="#how-it-works">How it works</a>
          <a data-cursor href="#faq">FAQ</a>
        </nav>
        <Link className="nav-cta" data-cursor to="/workspace">
          Open workspace <ArrowIcon />
        </Link>
      </header>

      <main>
        <section className="hero snap-section">
          <div className="hero-copy">
            <p className="kicker"><span className="kicker-rule" /> A quieter way to study</p>
            <h1>
              Find the thread between your <em>notes</em> and Scripture.
            </h1>
            <p className="hero-lede">
              Sermon Prep helps pastors, preachers, and Bible teachers surface every relevant passage in the moment it matters — while the thought is still warm.
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
              <span><strong>Built for the study desk.</strong> No noise. No detours.</span>
            </div>
          </div>

          <div className="hero-visual" ref={heroVisualRef} id="demo">
            <div className="visual-arch" aria-hidden="true" />
            <div className="visual-stamp" aria-hidden="true">SP<br /><small>EST. 2024</small></div>
            <div className="demo-window" aria-label="Sermon Prep product preview">
              <div className="window-bar">
                <div className="window-dots"><span /><span /><span /></div>
                <span className="window-title">sermon-prep / workspace</span>
                <span className="window-status"><i /> local & private</span>
              </div>
              <div className="demo-content">
                <div className="demo-notes">
                  <div className="demo-label"><span>01</span> Reading notes</div>
                  <p className="demo-note-heading">The shape of a<br /><em>steady hope</em></p>
                  <p className="demo-note-copy">Hope is not a vague feeling. It has a memory — and a direction. The prophets kept returning to the idea that...</p>
                  <div className="demo-note-line" />
                  <p className="demo-note-fade">...we are held, even here.</p>
                  <div className="demo-finding"><SparkIcon /> <span>4 references found</span></div>
                </div>
                <div className="demo-results">
                  <div className="demo-label"><span>02</span> Scripture threads</div>
                  <motion.div className="demo-result result-gold" animate={reduceMotion ? undefined : { y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="result-top"><span>Romans 5:3–5</span><CheckIcon /></div>
                    <p>“Suffering produces perseverance; perseverance, character; and character, hope.”</p>
                    <small>hope · perseverance</small>
                  </motion.div>
                  <motion.div className="demo-result result-rose" animate={reduceMotion ? undefined : { y: [0, 3, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
                    <div className="result-top"><span>Psalm 42:5</span><CheckIcon /></div>
                    <p>“Why, my soul, are you downcast? Put your hope in God.”</p>
                    <small>longing · trust</small>
                  </motion.div>
                  <div className="demo-more">+ 2 more passages <ArrowIcon /></div>
                </div>
              </div>
              <div className="demo-footer"><span><LockIcon /> Your notes stay on your device</span><span>WEB translation</span></div>
            </div>
            <div className="floating-note note-top"><span className="note-scribble">✣</span><span>Context-aware<br /><strong>suggestions</strong></span></div>
            <div className="floating-note note-bottom"><span className="note-number">02</span><span>From note<br /><strong>to passage</strong></span></div>
          </div>
        </section>

        <section className="trust-strip snap-section" aria-label="Sermon Prep principles">
          <div><span className="trust-icon"><LockIcon /></span><span><strong>Private by design</strong><small>Your study stays yours.</small></span></div>
          <div><span className="trust-icon sage"><BookIcon /></span><span><strong>Scripture first</strong><small>References, not distractions.</small></span></div>
          <div><span className="trust-icon rose"><SparkIcon /></span><span><strong>Made for the moment</strong><small>Move from insight to outline.</small></span></div>
          <div className="trust-aside">For the people who<br /><em>teach the Word.</em></div>
        </section>

        <section className="feature-section snap-section" id="features">
          <div className="section-heading reveal">
            <div>
              <p className="kicker light"><span className="kicker-rule" /> The useful kind of clever</p>
              <h2>Keep your study<br /><em>in the room.</em></h2>
            </div>
            <p>Everything you need to gather the biblical threads already present in your thinking — without sending you down another rabbit hole.</p>
          </div>
          <div className="feature-grid">
            <FeatureCard number="01" icon={<BookIcon />} title="Multi-passage lookup" copy="Paste a paragraph of notes. Sermon Prep finds the references hiding in plain sight, even when they arrive as a shorthand thought." accent="gold" />
            <FeatureCard number="02" icon={<CompassIcon />} title="Context-aware suggestions" copy="See nearby passages and recurring themes that give your central idea a deeper biblical shape." accent="rose" />
            <FeatureCard number="03" icon={<BookmarkIcon />} title="Save & organize" copy="Keep a clean collection of the passages, ideas, and little sparks you want to come back to on Sunday." accent="sage" />
            <FeatureCard number="04" icon={<ExportIcon />} title="Export for study" copy="Turn your reviewed references into a beautiful, practical PDF for the desk, the pulpit, or the road." accent="stone" />
          </div>
        </section>

        <section className="quote-section snap-section" aria-labelledby="testimonial-heading">
          <div className="quote-panel reveal">
            <div className="quote-mark">“</div>
            <div className="quote-content">
              <p className="kicker light"><span className="kicker-rule" /> From the study</p>
              <AnimatePresence mode="wait">
                <motion.blockquote key={currentTestimonial.quote} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: reduceMotion ? 0 : 0.45 }}>
                  {currentTestimonial.quote}
                </motion.blockquote>
              </AnimatePresence>
              <div className="quote-person">
                <span className={`avatar ${currentTestimonial.tone}`}>{currentTestimonial.initials}</span>
                <AnimatePresence mode="wait">
                  <motion.span key={currentTestimonial.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <strong>{currentTestimonial.name}</strong>
                    <small>{currentTestimonial.role}</small>
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="quote-controls">
                <div className="quote-progress"><span style={{ width: `${((testimonialIndex + 1) / testimonials.length) * 100}%` }} /></div>
                <button aria-label="Previous testimonial" data-cursor onClick={() => moveTestimonial(-1)}><span>←</span></button>
                <button aria-label="Next testimonial" data-cursor onClick={() => moveTestimonial(1)}><span>→</span></button>
              </div>
            </div>
            <div className={`quote-art ${currentTestimonial.tone}`} aria-hidden="true"><div className="quote-art-ring" /><div className="quote-art-cross">✦</div><span>Words<br />that<br /><em>hold.</em></span></div>
          </div>
          <div className="testimonial-caption"><span>01 / 03</span><span>Trusted by pastors, teachers, and thoughtful readers.</span><span>Since 2024</span></div>
        </section>

        <section className="steps-section snap-section" id="how-it-works">
          <div className="section-heading centered reveal">
            <p className="kicker"><span className="kicker-rule" /> A simple rhythm</p>
            <h2>From a passing thought<br />to a <em>grounded message.</em></h2>
            <p>Three small steps that leave more room for the work only you can do.</p>
          </div>
          <div className="steps-grid">
            <Step number="01" title="Bring your notes" copy="Paste in your sermon summary, reading notes, or the fragments you are still thinking through." icon={<PenIcon />} />
            <Step number="02" title="Review the threads" copy="Sermon Prep surfaces the Scripture references and lets you check, edit, and read them in context." icon={<SearchIcon />} />
            <Step number="03" title="Carry the message" copy="Save the passages you want to return to, then export a clean study sheet when the message is ready." icon={<ArrowUpIcon />} />
          </div>
        </section>

        <section className="access-section snap-section" id="early-access">
          <div className="access-copy reveal">
            <p className="kicker"><span className="kicker-rule" /> Early access</p>
            <h2>A little more room<br />for <em>the Word.</em></h2>
            <p>We are inviting a small first circle of pastors and teachers to help shape Sermon Prep. Bring your real study habits. We will bring the thoughtful details.</p>
            <div className="access-list"><span><CheckIcon /> Free while in early access</span><span><CheckIcon /> No credit card required</span><span><CheckIcon /> Your feedback shapes the tool</span></div>
          </div>
          <motion.div className="access-card reveal" whileHover={reduceMotion ? undefined : { y: -6 }}>
            <div className="access-card-top"><span className="access-badge">First circle</span><span>Limited invitations</span></div>
            <h3>Start with a<br /><em>clearer desk.</em></h3>
            {joined ? (
              <div className="joined-message"><span>✦</span><strong>You’re on the list.</strong><p>We’ll be in touch when your study desk is ready.</p></div>
            ) : (
              <form className="join-form" onSubmit={handleJoin}>
                <label htmlFor="early-access-email">Your email address</label>
                <div><input id="early-access-email" onChange={(event) => setEmail(event.target.value)} placeholder="you@church.org" required type="email" value={email} /><button className="button button-dark" data-cursor type="submit">Request an invite <ArrowIcon /></button></div>
                <small>We’ll only send the good kind of email.</small>
              </form>
            )}
            <div className="access-card-foot"><span><span className="online-dot" /> 34 thoughtful people joined this week</span></div>
          </motion.div>
        </section>

        <section className="faq-section snap-section" id="faq">
          <div className="faq-heading reveal"><p className="kicker"><span className="kicker-rule" /> Good questions</p><h2>Before you<br /><em>open the book.</em></h2><p>Still curious? Write to <a href="mailto:hello@sermonprep.co">hello@sermonprep.co</a>.</p></div>
          <div className="faq-list reveal">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={faq.question}>
                <button aria-expanded={isOpen} data-cursor onClick={() => setOpenFaq(isOpen ? -1 : index)} type="button"><span>{String(index + 1).padStart(2, "0")}</span><strong>{faq.question}</strong><i>{isOpen ? "−" : "+"}</i></button>
                <div className="faq-answer" style={{ maxHeight: isOpen ? 160 : 0 }}><p>{faq.answer}</p></div>
              </div>;
            })}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand"><Link className="brand light-brand" data-cursor to="/"><span className="brand-mark" aria-hidden="true"><span /><i /></span><span>Sermon Prep</span></Link><p>Make room for the message.</p></div>
          <div className="footer-newsletter"><p className="kicker light"><span className="kicker-rule" /> Notes from the margins</p><h3>Occasional thoughts<br /><em>for the study.</em></h3><form onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" placeholder="Your email address" type="email" /><button aria-label="Subscribe to newsletter" data-cursor type="submit"><ArrowIcon /></button></form></div>
          <div className="footer-links"><div><span>Explore</span><a data-cursor href="#features">Features</a><a data-cursor href="#how-it-works">How it works</a><Link data-cursor to="/workspace">Workspace</Link></div><div><span>Say hello</span><a data-cursor href="mailto:hello@sermonprep.co">Email us</a><a data-cursor href="#early-access">Early access</a></div></div>
        </div>
        <div className="footer-bottom"><span>© 2024 Sermon Prep</span><span>Made for the faithful & the still-learning.</span><span>Privacy · Terms</span></div>
      </footer>
    </div>
  );
}

function FeatureCard({ number, icon, title, copy, accent }: { number: string; icon: React.ReactNode; title: string; copy: string; accent: string }) {
  return <motion.article className={`feature-card ${accent} reveal`} whileHover={{ y: -8 }} transition={{ duration: 0.25 }}>
    <div className="feature-card-top"><span>{number}</span><span className="feature-icon">{icon}</span></div>
    <h3>{title}</h3><p>{copy}</p><span className="feature-arrow"><ArrowIcon /></span>
  </motion.article>;
}

function Step({ number, title, copy, icon }: { number: string; title: string; copy: string; icon: React.ReactNode }) {
  return <article className="step reveal"><div className="step-number">{number}</div><div className="step-icon">{icon}</div><h3>{title}</h3><p>{copy}</p></article>;
}

function WorkspacePage() {
  const [notes, setNotes] = useState("");
  const [references, setReferences] = useState<BibleReference[]>([]);
  const [passages, setPassages] = useState<Record<string, Passage>>({});
  const [mode, setMode] = useState<PdfExportMode>("references-and-text");
  const [fileName, setFileName] = useState("sermon-passages");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Paste notes to find Bible references.");

  const approvedPassages = useMemo(
    () => references.filter((reference) => reference.status === "valid").map((reference) => passages[referenceKey(reference)]).filter(Boolean),
    [passages, references],
  );

  async function handleFindPassages() {
    const parsed = parseBibleReferences(notes);
    setReferences(parsed);
    await refreshPassages(parsed);
    setStatusMessage(parsed.length === 1 ? "Found 1 reference." : `Found ${parsed.length} references.`);
  }

  async function refreshPassages(nextReferences: BibleReference[]) {
    const nextPassages: Record<string, Passage> = {};
    await Promise.all(nextReferences.filter((reference) => reference.status === "valid").map(async (reference) => {
      nextPassages[referenceKey(reference)] = await localWebProvider.getPassage("web", reference);
    }));
    setPassages(nextPassages);
    return nextPassages;
  }

  function updateReference(index: number, nextReference: BibleReference) {
    const nextReferences = references.map((reference, referenceIndex) => (referenceIndex === index ? nextReference : reference));
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  function handleReferenceTextChange(index: number, value: string) {
    setReferences(references.map((reference, referenceIndex) => referenceIndex === index ? { ...reference, raw: value, normalized: value, status: "needs-review" as const, issues: ["Edited reference has not been validated yet."] } : reference));
  }

  function handleReferenceTextBlur(index: number) {
    const reference = references[index];
    if (!reference) return;
    const parsed = parseSingleBibleReference(reference.normalized);
    if (parsed) updateReference(index, parsed);
  }

  function handleStatusChange(index: number, status: ReferenceStatus) {
    const nextReferences = references.map((reference, referenceIndex) => referenceIndex === index ? { ...reference, status, issues: status === "valid" ? [] : reference.issues } : reference);
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  function handleRemoveReference(index: number) {
    const nextReferences = references.filter((_, referenceIndex) => referenceIndex !== index);
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      const currentPassages = await refreshPassages(references);
      const validPassages = references.filter((reference) => reference.status === "valid").map((reference) => currentPassages[referenceKey(reference)] ?? passages[referenceKey(reference)]).filter(Boolean);
      const bytes = await buildPassagePdf({ title: "Sermon Passages", mode, passages: validPassages.length > 0 ? validPassages : approvedPassages });
      downloadPdf(bytes, toPdfFileName(fileName));
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return <div className="workspace-page">
    <header className="workspace-topbar"><Link className="brand" data-cursor to="/"><span className="brand-mark" aria-hidden="true"><span /><i /></span><span>Sermon Prep</span></Link><div className="workspace-breadcrumb"><span>Workspace</span><i>/</i><strong>Scripture review</strong></div><Link className="workspace-back" data-cursor to="/"><span>Back to site</span><ArrowUpIcon /></Link></header>
    <main className="workspace-shell">
      <div className="workspace-intro"><div><p className="kicker"><span className="kicker-rule" /> The study desk</p><h1>Scripture review</h1></div><div className="workspace-intro-note"><span className="online-dot" /> <span><strong>Local & private</strong><small>Your notes never leave this device.</small></span></div></div>
      <div className="workspace-grid">
        <section className="workspace-card notes-pane" aria-labelledby="notes-heading">
          <div className="workspace-card-heading"><div><span className="card-index">01</span><h2 id="notes-heading">Bring your notes</h2></div><span className="card-symbol">✦</span></div>
          <p className="workspace-help">Paste a sermon summary, outline, or reading notes. We’ll gather the biblical threads for you.</p>
          <textarea aria-label="Sermon notes" onChange={(event) => setNotes(event.target.value)} placeholder="Paste notes with references like John 3:16; Psalm 23:1–4, or 1 Corinthians 13:4–7." rows={18} value={notes} />
          <div className="notes-footer"><p className="status-line"><span className="status-dot" /> {statusMessage}</p><button className="button button-dark" data-cursor onClick={handleFindPassages} type="button">Find passages <ArrowIcon /></button></div>
        </section>

        <section className="workspace-card review-pane" aria-labelledby="review-heading">
          <div className="workspace-card-heading"><div><span className="card-index">02</span><h2 id="review-heading">Detected references</h2></div><span className="reference-count">{references.length > 0 ? `${references.length} found` : "Waiting"}</span></div>
          <div className="export-controls" role="group" aria-label="PDF export options"><label className="file-name-field">File name<input aria-label="PDF file name" onChange={(event) => setFileName(event.target.value)} placeholder="sermon-passages" value={fileName} /></label><div className="mode-fields"><label><input checked={mode === "references"} name="mode" onChange={() => setMode("references")} type="radio" /> References</label><label><input checked={mode === "references-and-text"} name="mode" onChange={() => setMode("references-and-text")} type="radio" /> Text</label></div><button className="button button-outline" data-cursor disabled={references.length === 0 || isDownloadingPdf} type="button" onClick={handleDownloadPdf}>{isDownloadingPdf ? "Preparing..." : "Download PDF"} <ExportIcon /></button></div>
          <div className="reference-list">
            {references.length === 0 ? <div className="empty-state"><span className="empty-symbol">◌</span><strong>Your references will appear here.</strong><p>Start by pasting notes on the left.</p></div> : references.map((reference, index) => {
              const passage = passages[referenceKey(reference)];
              return <article className="reference-row" key={`${reference.sourceStart}-${reference.normalized}`}><div className="reference-edit"><input aria-label={`Reference ${index + 1}`} onBlur={() => handleReferenceTextBlur(index)} onChange={(event) => handleReferenceTextChange(index, event.target.value)} value={reference.normalized} /><select aria-label={`Status for ${reference.normalized}`} onChange={(event) => handleStatusChange(index, event.target.value as ReferenceStatus)} value={reference.status}><option value="valid">Valid</option><option value="needs-review">Needs review</option><option value="invalid">Invalid</option></select><button aria-label={`Remove ${reference.normalized}`} className="remove-button" data-cursor type="button" onClick={() => handleRemoveReference(index)}>Remove</button></div><p className={`status-pill ${reference.status}`}>{reference.status}</p>{reference.issues.length > 0 ? <p className="issue-line">{reference.issues.join(" ")}</p> : null}{passage ? <blockquote>{passage.verses.slice(0, 4).map((verse) => <p key={`${verse.chapter}-${verse.verse}`}><sup>{verse.chapter}:{verse.verse}</sup>{" "}{verse.text}</p>)}{passage.verses.length > 4 ? <p className="more-line">{passage.verses.length - 4} more verses included in export.</p> : null}</blockquote> : null}</article>;
            })}
          </div>
        </section>
      </div>
    </main>
  </div>;
}

function referenceKey(reference: BibleReference): string {
  return [reference.bookId, reference.chapterStart, reference.verseStart ?? "", reference.chapterEnd, reference.verseEnd ?? ""].join("|");
}

function toPdfFileName(value: string): string {
  const cleaned = value.trim().replace(/\.pdf$/i, "").replace(/[^A-Za-z0-9._ -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  return `${cleaned || "sermon-passages"}.pdf`;
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 18 18"><path d="M3 9h11M9.5 4.5 14 9l-4.5 4.5" /></svg>;
}

function ArrowUpIcon() {
  return <svg aria-hidden="true" viewBox="0 0 18 18"><path d="m5 13 8-8M6 5h7v7" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 18 18"><path d="m3.5 9 3.5 3.5 7.5-7" /></svg>;
}

function BookIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4.5 5.5c2.8-1.3 5.3-.9 7.5.8v12.2c-2.2-1.7-4.7-2.1-7.5-.8V5.5Zm15 0c-2.8-1.3-5.3-.9-7.5.8v12.2c2.2-1.7 4.7-2.1 7.5-.8V5.5Z" /></svg>;
}

function BookmarkIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.5 4.5h11v16l-5.5-3.4-5.5 3.4v-16Z" /></svg>;
}

function ExportIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v11m0-11 4 4m-4-4L8 8M5 12v6.5h14V12" /></svg>;
}

function CompassIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></svg>;
}

function PenIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 16.5-.8 3.3 3.3-.8L19 7.5 16.5 5 5 16.5Zm10.8-10.8 2.5 2.5M5 20h14" /></svg>;
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
}

function SparkIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 1.5 7.5L21 12l-7.5 1.5L12 21l-1.5-7.5L3 12l7.5-1.5L12 3Z" /></svg>;
}

function LockIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5.5" y="10" width="13" height="10" rx="1.5" /><path d="M8 10V7.8a4 4 0 0 1 8 0V10" /></svg>;
}
