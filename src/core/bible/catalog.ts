import booksJson from "../../../data/bibles/web/books.json";

import type { BibleBook, BibleReference, ReferenceStatus, ValidationResult } from "./types";

export const bibleBooks = booksJson as BibleBook[];

export const booksById = new Map(bibleBooks.map((book) => [book.id, book]));

export function getBook(bookId: string): BibleBook | undefined {
  return booksById.get(bookId);
}

export function getVerseCount(bookId: string, chapter: number): number | null {
  const book = getBook(bookId);
  return book?.chapters[chapter - 1]?.verseCount ?? null;
}

export function normalizeBibleReference(reference: Pick<BibleReference, "bookId" | "chapterStart" | "verseStart" | "chapterEnd" | "verseEnd">): string {
  const book = getBook(reference.bookId);
  const bookName = book?.name ?? reference.bookId;

  if (reference.verseStart === null) {
    return reference.chapterStart === reference.chapterEnd
      ? `${bookName} ${reference.chapterStart}`
      : `${bookName} ${reference.chapterStart}-${reference.chapterEnd}`;
  }

  if (reference.chapterStart === reference.chapterEnd) {
    return reference.verseStart === reference.verseEnd
      ? `${bookName} ${reference.chapterStart}:${reference.verseStart}`
      : `${bookName} ${reference.chapterStart}:${reference.verseStart}-${reference.verseEnd}`;
  }

  return `${bookName} ${reference.chapterStart}:${reference.verseStart}-${reference.chapterEnd}:${reference.verseEnd}`;
}

export function validateBibleReference(reference: Pick<BibleReference, "bookId" | "chapterStart" | "verseStart" | "chapterEnd" | "verseEnd">): ValidationResult {
  const issues: string[] = [];
  const book = getBook(reference.bookId);

  if (!book) {
    return { status: "invalid", issues: [`Unknown book: ${reference.bookId}.`] };
  }

  const maxChapter = book.chapters.length;
  if (reference.chapterStart < 1 || reference.chapterStart > maxChapter) {
    issues.push(`${book.name} has chapters 1-${maxChapter}; chapter ${reference.chapterStart} is outside that range.`);
  }

  if (reference.chapterEnd < 1 || reference.chapterEnd > maxChapter) {
    issues.push(`${book.name} has chapters 1-${maxChapter}; chapter ${reference.chapterEnd} is outside that range.`);
  }

  if (
    reference.chapterEnd < reference.chapterStart ||
    (reference.chapterEnd === reference.chapterStart &&
      reference.verseStart !== null &&
      reference.verseEnd !== null &&
      reference.verseEnd < reference.verseStart)
  ) {
    issues.push("Reference range ends before it starts.");
  }

  if (reference.verseStart !== null) {
    const maxStartVerse = getVerseCount(reference.bookId, reference.chapterStart);
    if (maxStartVerse === null || reference.verseStart < 1 || reference.verseStart > maxStartVerse) {
      issues.push(`${book.name} ${reference.chapterStart} has verses 1-${maxStartVerse ?? 0}; verse ${reference.verseStart} is outside that range.`);
    }
  }

  if (reference.verseEnd !== null) {
    const maxEndVerse = getVerseCount(reference.bookId, reference.chapterEnd);
    if (maxEndVerse === null || reference.verseEnd < 1 || reference.verseEnd > maxEndVerse) {
      issues.push(`${book.name} ${reference.chapterEnd} has verses 1-${maxEndVerse ?? 0}; verse ${reference.verseEnd} is outside that range.`);
    }
  }

  let status: ReferenceStatus = "valid";
  if (issues.length > 0) {
    status = "invalid";
  } else if (reference.verseStart === null && reference.chapterStart !== reference.chapterEnd) {
    status = "needs-review";
    issues.push("Whole-chapter range detected; confirm this is the intended span.");
  }

  return { status, issues };
}
