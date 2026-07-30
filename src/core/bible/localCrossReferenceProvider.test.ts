import { describe, expect, it, vi } from "vitest";

import type { Passage, PassageVerse } from "./types";
import { localCrossReferenceProvider } from "./localCrossReferenceProvider";

const crossReferenceFixture = vi.hoisted(() => ({
  default: {
    references: {
      "matthew.4.4": [
        { target: "psalms.2.7", score: 4 },
        { target: "deuteronomy.8.3", score: 9 },
        { target: "deuteronomy.8.3", score: 12 },
        { target: "genesis.1.1", score: 0 },
        { target: "romans.2.6-romans.2.10", score: 3 },
      ],
      "matthew.4.5": [{ target: "psalms.2.7", score: 7 }],
    },
  },
}));

vi.mock("../../../data/cross-references/openbible.json", () => crossReferenceFixture);

function makePassage(...verses: PassageVerse[]): Passage {
  return {
    reference: {} as Passage["reference"],
    versionId: "web",
    versionName: "World English Bible",
    normalized: "fixture",
    verses,
  };
}

describe("localCrossReferenceProvider", () => {
  it("ranks positive links and keeps the highest score for duplicates", async () => {
    const related = await localCrossReferenceProvider.getRelatedPassages(
      makePassage(
        { bookId: "matthew", chapter: 4, verse: 4, text: "" },
        { bookId: "matthew", chapter: 4, verse: 5, text: "" },
      ),
      10,
    );

    expect(related.map(({ normalized, score }) => ({ normalized, score }))).toEqual([
      { normalized: "Deuteronomy 8:3", score: 12 },
      { normalized: "Psalms 2:7", score: 7 },
      { normalized: "Romans 2:6-10", score: 3 },
    ]);
  });

  it("excludes zero and negative scores", async () => {
    const related = await localCrossReferenceProvider.getRelatedPassages(
      makePassage({ bookId: "matthew", chapter: 4, verse: 4, text: "" }),
      10,
    );

    expect(related.map(({ normalized }) => normalized)).not.toContain("Genesis 1:1");
  });

  it("returns an empty result for an unmapped passage and honors limits", async () => {
    const empty = await localCrossReferenceProvider.getRelatedPassages(
      makePassage({ bookId: "john", chapter: 3, verse: 16, text: "" }),
      5,
    );
    const limited = await localCrossReferenceProvider.getRelatedPassages(
      makePassage({ bookId: "matthew", chapter: 4, verse: 4, text: "" }),
      1,
    );
    const zero = await localCrossReferenceProvider.getRelatedPassages(
      makePassage({ bookId: "matthew", chapter: 4, verse: 4, text: "" }),
      0,
    );

    expect(empty).toEqual([]);
    expect(limited.map(({ normalized }) => normalized)).toEqual(["Deuteronomy 8:3"]);
    expect(zero).toEqual([]);
  });
});
