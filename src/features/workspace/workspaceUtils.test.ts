import { describe, expect, it } from "vitest";

import type { RelatedPassage } from "../../core/bible/types";
import { localWebProvider } from "../../core/provider/localWebProvider";
import { relatedPassageKey, relatedPassageToReference } from "./workspaceUtils";

const relatedPassage: RelatedPassage = {
  bookId: "john",
  chapterStart: 3,
  verseStart: 16,
  chapterEnd: 3,
  verseEnd: 17,
  normalized: "John 3:16-17",
  score: 0.9,
};

describe("related passage workspace utilities", () => {
  it("creates a stable key from a related passage range", () => {
    expect(relatedPassageKey(relatedPassage)).toBe("john|3|16|3|17");
  });

  it("converts a related passage into a valid local-provider reference", () => {
    const reference = relatedPassageToReference(relatedPassage);

    expect(reference).toMatchObject({
      id: "related-john|3|16|3|17",
      normalized: "John 3:16-17",
      bookId: "john",
      chapterStart: 3,
      verseStart: 16,
      chapterEnd: 3,
      verseEnd: 17,
      status: "valid",
    });
  });

  it("loads the converted related range from the bundled WEB data", async () => {
    const passage = await localWebProvider.getPassage(
      "web",
      relatedPassageToReference(relatedPassage),
    );

    expect(passage.normalized).toBe("John 3:16-17");
    expect(passage.verses.map((verse) => verse.verse)).toEqual([16, 17]);
    expect(passage.verses[0]?.text).toContain("For God so loved the world");
  });

  it("rejects an out-of-range converted related passage", async () => {
    const outOfRangePassage: RelatedPassage = {
      ...relatedPassage,
      normalized: "John 3:999",
      verseStart: 999,
      verseEnd: 999,
    };
    const reference = relatedPassageToReference(outOfRangePassage);

    expect(reference.status).toBe("valid");
    await expect(localWebProvider.getPassage("web", reference)).rejects.toThrow();
  });
});
