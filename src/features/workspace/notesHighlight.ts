import type { BibleReference, BibleReferenceOccurrence } from "../../core/bible/types";

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
  const ranges = activeReference ? getReliableSourceRanges(notes, activeReference) : [];

  if (ranges.length === 0) {
    return [{ text: notes, isHighlighted: false }];
  }

  const segments: NotesSegment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start < cursor) continue;

    if (range.start > cursor) {
      segments.push({ text: notes.slice(cursor, range.start), isHighlighted: false });
    }

    segments.push({ text: notes.slice(range.start, range.end), isHighlighted: true });
    cursor = range.end;
  }

  if (cursor < notes.length) {
    segments.push({ text: notes.slice(cursor), isHighlighted: false });
  }

  return segments;
}

function getReliableSourceRanges(
  notes: string,
  reference: BibleReference,
): { start: number; end: number }[] {
  const occurrences: BibleReferenceOccurrence[] = reference.occurrences ?? [
    {
      raw: reference.raw,
      sourceStart: reference.sourceStart,
      sourceEnd: reference.sourceEnd,
    },
  ];

  return occurrences
    .map((occurrence) => getReliableSourceRange(notes, occurrence))
    .filter((range): range is { start: number; end: number } => range !== null)
    .sort((a, b) => a.start - b.start);
}

function getReliableSourceRange(
  notes: string,
  occurrence: BibleReferenceOccurrence,
): { start: number; end: number } | null {
  const start = occurrence.sourceStart;
  const end = occurrence.sourceEnd;

  if (start < 0 || end <= start || end > notes.length) return null;

  const sourceText = notes.slice(start, end);
  if (sourceText === occurrence.raw) {
    return { start, end };
  }

  const trimmedSourceText = sourceText.trimEnd();
  if (trimmedSourceText === occurrence.raw) {
    return { start, end: start + trimmedSourceText.length };
  }

  return null;
}
