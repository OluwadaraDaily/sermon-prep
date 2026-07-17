import type { BibleReference, Passage } from "../../core/bible/types";

export function referenceKey(reference: BibleReference): string {
  return [
    reference.bookId,
    reference.chapterStart,
    reference.verseStart ?? "",
    reference.chapterEnd,
    reference.verseEnd ?? "",
  ].join("|");
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
