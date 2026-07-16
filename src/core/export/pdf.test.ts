import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Passage } from "../bible/types";

import { buildPassagePdf } from "./pdf";

describe("buildPassagePdf", () => {
  beforeEach(() => {
    const originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", async (url: string) => {
      if (url.startsWith("/src/assets/fonts/")) {
        const bytes = await readFile(join(process.cwd(), url));
        return new Response(new Uint8Array(bytes));
      }

      return originalFetch(url);
    });
  });

  it("builds a PDF byte stream with reference and verse text", async () => {
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

    const bytes = await buildPassagePdf({ title: "Sermon Passages", mode: "references-and-text", passages: [passage] });
    const text = new TextDecoder().decode(bytes);

    expect(text.startsWith("%PDF-")).toBe(true);
    expect(bytes.length).toBeGreaterThan(5_000);
  });
});
