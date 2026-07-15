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
});
