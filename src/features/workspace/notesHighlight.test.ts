import { describe, expect, it } from "vitest";

import { parseBibleReferences } from "../../core/references/parser";
import { buildNotesSegments } from "./notesHighlight";

describe("buildNotesSegments", () => {
  it("highlights the active reference source span", () => {
    const notes = "Read John 3:16 and Romans 8:1 this week.";
    const references = parseBibleReferences(notes);

    expect(buildNotesSegments(notes, references, references[1].id)).toEqual([
      { text: "Read John 3:16 and ", isHighlighted: false },
      { text: "Romans 8:1", isHighlighted: true },
      { text: " this week.", isHighlighted: false },
    ]);
  });

  it("does not highlight a stale source span", () => {
    const notes = "Read something else.";
    const references = parseBibleReferences("Read John 3:16.");

    expect(buildNotesSegments(notes, references, references[0].id)).toEqual([
      { text: notes, isHighlighted: false },
    ]);
  });

  it("returns the notes unchanged without an active reference", () => {
    const notes = "Read John 3:16.";
    const references = parseBibleReferences(notes);

    expect(buildNotesSegments(notes, references, null)).toEqual([
      { text: notes, isHighlighted: false },
    ]);
  });
});
