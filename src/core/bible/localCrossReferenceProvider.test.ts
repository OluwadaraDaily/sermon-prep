import { describe, expect, it } from "vitest";

import { parseSingleBibleReference } from "../references/parser";
import { localCrossReferenceProvider } from "./localCrossReferenceProvider";
import { localWebProvider } from "../provider/localWebProvider";

describe("localCrossReferenceProvider", () => {
  it("returns ranked related passages for a loaded passage", async () => {
    const reference = parseSingleBibleReference("Matthew 4:4");
    expect(reference).not.toBeNull();

    const passage = await localWebProvider.getPassage("web", reference!);
    const related = await localCrossReferenceProvider.getRelatedPassages(passage);

    expect(related).toHaveLength(5);
    expect(related[0]).toMatchObject({
      normalized: "Deuteronomy 8:3",
      score: 389,
    });
    expect(related.every((item) => item.normalized.length > 0)).toBe(true);
  });

  it("deduplicates targets across multiple source verses", async () => {
    const reference = parseSingleBibleReference("Romans 4:3-4");
    expect(reference).not.toBeNull();

    const passage = await localWebProvider.getPassage("web", reference!);
    const related = await localCrossReferenceProvider.getRelatedPassages(passage, 20);
    const normalized = related.map((item) => item.normalized);

    expect(new Set(normalized).size).toBe(normalized.length);
    expect(normalized).toContain("Genesis 15:6");
  });

  it("formats ranges with hyphenated book names correctly", async () => {
    const reference = parseSingleBibleReference("Psalms 51:4");
    expect(reference).not.toBeNull();

    const passage = await localWebProvider.getPassage("web", reference!);
    const related = await localCrossReferenceProvider.getRelatedPassages(passage, 50);

    expect(related).toContainEqual(
      expect.objectContaining({
        normalized: "2 Samuel 12:13-14",
        score: 15,
      }),
    );
  });
});
