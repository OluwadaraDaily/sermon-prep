import { describe, expect, it } from "vitest";

import type { RelatedPassage } from "../../core/bible/types";
import { relatedPassageKey, relatedPassageToReference } from "./workspaceUtils";

const relatedPassage: RelatedPassage = {
  bookId: "John",
  chapterStart: 3,
  verseStart: 16,
  chapterEnd: 3,
  verseEnd: 17,
  normalized: "John 3:16-17",
  score: 0.9,
};

describe("related passage workspace utilities", () => {
  it("creates a stable key from a related passage range", () => {
    expect(relatedPassageKey(relatedPassage)).toBe("John|3|16|3|17");
  });

  it("converts a related passage into a valid local-provider reference", () => {
    expect(relatedPassageToReference(relatedPassage)).toMatchObject({
      id: "related-John|3|16|3|17",
      normalized: "John 3:16-17",
      bookId: "John",
      chapterStart: 3,
      verseStart: 16,
      chapterEnd: 3,
      verseEnd: 17,
      status: "valid",
    });
  });
});
