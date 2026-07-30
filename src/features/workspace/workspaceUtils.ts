import type { BibleReference, Passage, RelatedPassage } from "../../core/bible/types";

export function referenceKey(reference: BibleReference): string {
  return [
    reference.bookId,
    reference.chapterStart,
    reference.verseStart ?? "",
    reference.chapterEnd,
    reference.verseEnd ?? "",
  ].join("|");
}

export function relatedPassageKey(passage: RelatedPassage): string {
  return [
    passage.bookId,
    passage.chapterStart,
    passage.verseStart,
    passage.chapterEnd,
    passage.verseEnd,
  ].join("|");
}

export function relatedPassageToReference(passage: RelatedPassage): BibleReference {
  return {
    id: `related-${relatedPassageKey(passage)}`,
    raw: passage.normalized,
    normalized: passage.normalized,
    sourceStart: 0,
    sourceEnd: passage.normalized.length,
    bookId: passage.bookId,
    chapterStart: passage.chapterStart,
    verseStart: passage.verseStart,
    chapterEnd: passage.chapterEnd,
    verseEnd: passage.verseEnd,
    confidence: 1,
    status: "valid",
    issues: [],
  };
}

export function toPdfFileName(value: string): string {
  const cleaned = value
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9._ -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${cleaned || "sermon-passages"}.pdf`;
}

export function isPassage(value: Passage | undefined): value is Passage {
  return Boolean(value);
}
