import type { IconName } from "../components/common/Icons";

export type Accent = "gold" | "rose" | "sage" | "stone";
export type TestimonialTone = "rose" | "sage" | "gold";

export interface FeatureContent {
  accent: Accent;
  copy: string;
  icon: IconName;
  number: string;
  title: string;
}

export interface StepContent {
  copy: string;
  icon: IconName;
  number: string;
  title: string;
}

export interface TestimonialContent {
  initials: string;
  name: string;
  quote: string;
  role: string;
  tone: TestimonialTone;
}

export const features: FeatureContent[] = [
  {
    number: "01",
    icon: "book",
    title: "Multi-passage lookup",
    copy: "Paste a paragraph of notes. Sermon Prep finds the references hiding in plain sight, even when they arrive as a shorthand thought.",
    accent: "gold",
  },
  {
    number: "02",
    icon: "compass",
    title: "Context-aware suggestions",
    copy: "See nearby passages and recurring themes that give your central idea a deeper biblical shape.",
    accent: "rose",
  },
  {
    number: "03",
    icon: "bookmark",
    title: "Save & organize",
    copy: "Keep a clean collection of the passages, ideas, and little sparks you want to come back to on Sunday.",
    accent: "sage",
  },
  {
    number: "04",
    icon: "export",
    title: "Export for study",
    copy: "Turn your reviewed references into a beautiful, practical PDF for the desk, the pulpit, or the road.",
    accent: "stone",
  },
];

export const steps: StepContent[] = [
  {
    number: "01",
    title: "Bring your notes",
    copy: "Paste in your sermon summary, reading notes, or the fragments you are still thinking through.",
    icon: "pen",
  },
  {
    number: "02",
    title: "Review the threads",
    copy: "Sermon Prep surfaces the Scripture references and lets you check, edit, and read them in context.",
    icon: "search",
  },
  {
    number: "03",
    title: "Carry the message",
    copy: "Save the passages you want to return to, then export a clean study sheet when the message is ready.",
    icon: "arrow-up",
  },
];

export const testimonials: TestimonialContent[] = [
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

export const faqs = [
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
