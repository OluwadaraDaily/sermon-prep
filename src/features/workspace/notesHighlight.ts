import type { BibleReference } from "../../core/bible/types";

export type NotesSegment = {
  text: string;
  isHighlighted: boolean;
};

export function buildNotesSegments(
  notes: string,
  references: BibleReference[],
  activeReferenceId: string | null,
): NotesSegment[] {
  if (!notes || !activeReferenceId) {
    return [{ text: notes, isHighlighted: false }];
  }

  const activeReference = references.find((reference) => reference.id === activeReferenceId);
  const range = activeReference ? getReliableSourceRange(notes, activeReference) : null;

  if (!range) {
    return [{ text: notes, isHighlighted: false }];
  }

  return [
    { text: notes.slice(0, range.start), isHighlighted: false },
    { text: notes.slice(range.start, range.end), isHighlighted: true },
    { text: notes.slice(range.end), isHighlighted: false },
  ].filter((segment) => segment.text.length > 0);
}

function getReliableSourceRange(
  notes: string,
  reference: BibleReference,
): { start: number; end: number } | null {
  const start = reference.sourceStart;
  const end = reference.sourceEnd;

  if (start < 0 || end <= start || end > notes.length) {
    return null;
  }

  const sourceText = notes.slice(start, end);
  if (sourceText === reference.raw) {
    return { start, end };
  }

  const trimmedSourceText = sourceText.trimEnd();
  if (trimmedSourceText === reference.raw) {
    return { start, end: start + trimmedSourceText.length };
  }

  return null;
}
