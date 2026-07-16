import { describe, expect, it } from "vitest";

import { parseSingleBibleReference } from "../references/parser";

import { localWebProvider } from "./localWebProvider";

describe("localWebProvider", () => {
  it("lists the local WEB version", async () => {
    await expect(localWebProvider.listVersions()).resolves.toEqual([
      expect.objectContaining({ id: "web", name: "World English Bible" }),
    ]);
  });

  it("retrieves local WEB passage text", async () => {
    const reference = parseSingleBibleReference("John 3:16");
    expect(reference).not.toBeNull();

    const passage = await localWebProvider.getPassage("web", reference!);

    expect(passage.normalized).toBe("John 3:16");
    expect(passage.verses).toHaveLength(1);
    expect(passage.verses[0].text).toContain("For God so loved the world");
  });

  it("does not include HTML footer, navigation, or footnote text in chapter exports", async () => {
    const reference = parseSingleBibleReference("John 8");
    expect(reference).not.toBeNull();

    const passage = await localWebProvider.getPassage("web", reference!);
    const fullText = passage.verses.map((verse) => verse.text).join(" ");

    expect(passage.verses).toHaveLength(59);
    expect(fullText).not.toContain("Frequently Asked Questions");
    expect(fullText).not.toContain("Donations");
    expect(fullText).not.toContain("textual critics");
    expect(passage.verses.at(-1)?.text).toBe(
      "Therefore they took up stones to throw at him, but Jesus hid himself and went out of the temple, having gone through the middle of them, and so passed by."
    );
  });
});
