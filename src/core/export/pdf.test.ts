import { describe, expect, it } from "vitest";

import type { Passage } from "../bible/types";

import { buildPassagePdf } from "./pdf";

describe("buildPassagePdf", () => {
  it("builds a PDF byte stream with reference and verse text", () => {
    const passage = {
      normalized: "John 3:16",
      verses: [{ bookId: "john", chapter: 3, verse: 16, text: "For God so loved the world." }],
      reference: {
        raw: "John 3:16",
        normalized: "John 3:16",
        sourceStart: 0,
        sourceEnd: 9,
        bookId: "john",
        chapterStart: 3,
        verseStart: 16,
        chapterEnd: 3,
        verseEnd: 16,
        confidence: 0.96,
        status: "valid",
        issues: [],
      },
      versionId: "web",
      versionName: "World English Bible",
    } satisfies Passage;

    const bytes = buildPassagePdf({ title: "Sermon Passages", mode: "references-and-text", passages: [passage] });
    const text = new TextDecoder().decode(bytes);

    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("/BaseFont /Helvetica-Bold");
    expect(text).toContain("/F2 10 Tf");
    expect(text).toContain("John 3:16");
    expect(text).toContain("For God so loved the world.");
  });
});
