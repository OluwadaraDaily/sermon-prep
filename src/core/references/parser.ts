import { bibleBooks, normalizeBibleReference, validateBibleReference } from "../bible/catalog";

import type { BibleBook, BibleReference } from "../bible/types";

type AliasEntry = {
  book: BibleBook;
  alias: string;
  pattern: string;
};

type ParsedSpan = {
  chapterStart: number;
  verseStart: number | null;
  chapterEnd: number;
  verseEnd: number | null;
  startOffset: number;
  endOffset: number;
  confidence: number;
  issues: string[];
  lastChapter: number;
  hasVerseContext: boolean;
};

const aliasEntries = bibleBooks
  .flatMap((book) =>
    book.aliases.map((alias) => ({
      book,
      alias,
      pattern: aliasToPattern(alias),
    }))
  )
  .sort((a, b) => b.alias.length - a.alias.length);

const bookAliasRegex = new RegExp(`(${aliasEntries.map((entry) => entry.pattern).join("|")})\\.?\\s*(?=\\d)`, "giu");

export function parseBibleReferences(source: string): BibleReference[] {
  const references: BibleReference[] = [];
  bookAliasRegex.lastIndex = 0;

  for (let match = bookAliasRegex.exec(source); match; match = bookAliasRegex.exec(source)) {
    const matchedAlias = match[1];
    const sourceStart = match.index;

    if (!hasBoundaryBefore(source, sourceStart)) {
      continue;
    }

    const entry = findAliasEntry(matchedAlias);
    if (!entry) {
      continue;
    }

    const series = parseSeries(source, bookAliasRegex.lastIndex, entry.book, sourceStart);
    if (series.references.length === 0) {
      continue;
    }

    references.push(...series.references);
    bookAliasRegex.lastIndex = Math.max(bookAliasRegex.lastIndex, series.end);
  }

  return deduplicateReferences(references);
}

export function parseSingleBibleReference(source: string): BibleReference | null {
  const references = parseBibleReferences(source);
  return references.length === 1 ? references[0] : null;
}

export function deduplicateReferences(references: BibleReference[]): BibleReference[] {
  const seen = new Set<string>();
  const deduped: BibleReference[] = [];

  for (const reference of references) {
    const key = [
      reference.bookId,
      reference.chapterStart,
      reference.verseStart ?? "",
      reference.chapterEnd,
      reference.verseEnd ?? "",
    ].join("|");

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(reference);
    }
  }

  return deduped;
}

function parseSeries(source: string, offset: number, book: BibleBook, bookStart: number): { references: BibleReference[]; end: number } {
  const references: BibleReference[] = [];
  let cursor = offset;
  let context: ParsedSpan | null = null;
  let separator: string | null = null;
  let first = true;

  while (cursor < source.length) {
    cursor = skipSpaces(source, cursor);
    const span: ParsedSpan | null = first ? parseChapterVerseSpan(source, cursor, null) : parseContextSpan(source, cursor, context, separator);

    if (!span) {
      break;
    }

    const rawStart = first ? bookStart : span.startOffset;
    const rawEnd = span.endOffset;
    references.push(toBibleReference(source, rawStart, rawEnd, book, span));
    context = span;
    cursor = span.endOffset;
    first = false;

    const next = nextSeparator(source, cursor);
    if (!next) {
      break;
    }

    const nextStart = skipSpaces(source, next.end);
    if (!/^\d/.test(source.slice(nextStart))) {
      break;
    }

    separator = next.value;
    cursor = nextStart;
  }

  return { references, end: references.at(-1)?.sourceEnd ?? offset };
}

function parseChapterVerseSpan(source: string, offset: number, context: ParsedSpan | null): ParsedSpan | null {
  const match = /^(\d{1,3})(?::(\d{1,3}))?(?:\s*[-–]\s*(?:(\d{1,3}):)?(\d{1,3}))?/.exec(source.slice(offset));
  if (!match) {
    return null;
  }

  const first = Number(match[1]);
  const second = match[2] ? Number(match[2]) : null;
  const rangeChapter = match[3] ? Number(match[3]) : null;
  const rangeFinal = match[4] ? Number(match[4]) : null;
  const hasColon = second !== null;
  const consumed = match[0].length;

  const chapterStart = first;
  const verseStart: number | null = second;
  let chapterEnd = first;
  let verseEnd: number | null = second;
  const issues: string[] = [];
  let confidence = 0.96;

  if (rangeFinal !== null && hasColon) {
    chapterEnd = rangeChapter ?? chapterStart;
    verseEnd = rangeFinal;
  } else if (rangeFinal !== null) {
    chapterEnd = rangeFinal;
    verseEnd = null;
    confidence = 0.82;
  }

  if (context && !hasColon) {
    issues.push("Context-only chapter reference detected; confirm the intended chapter.");
    confidence = Math.min(confidence, 0.86);
  }

  return {
    chapterStart,
    verseStart,
    chapterEnd,
    verseEnd,
    startOffset: offset,
    endOffset: offset + consumed,
    confidence,
    issues,
    lastChapter: chapterEnd,
    hasVerseContext: verseStart !== null,
  };
}

function parseContextSpan(source: string, offset: number, context: ParsedSpan | null, separator: string | null): ParsedSpan | null {
  if (!context) {
    return null;
  }

  const match = /^(\d{1,3})(?::(\d{1,3}))?(?:\s*[-–]\s*(?:(\d{1,3}):)?(\d{1,3}))?/.exec(source.slice(offset));
  if (!match) {
    return null;
  }

  const first = Number(match[1]);
  const second = match[2] ? Number(match[2]) : null;
  const rangeFinal = match[4] ? Number(match[4]) : null;
  const consumed = match[0].length;
  const commaContext = separator === ",";
  const hasExplicitChapter = second !== null;

  if (commaContext && context.hasVerseContext && !hasExplicitChapter) {
    return {
      chapterStart: context.lastChapter,
      verseStart: first,
      chapterEnd: context.lastChapter,
      verseEnd: rangeFinal ?? first,
      startOffset: offset,
      endOffset: offset + consumed,
      confidence: 0.9,
      issues: ["Verse list detected from previous chapter context."],
      lastChapter: context.lastChapter,
      hasVerseContext: true,
    };
  }

  if (hasExplicitChapter || !context.hasVerseContext) {
    return parseChapterVerseSpan(source, offset, context);
  }

  return null;
}

function toBibleReference(source: string, sourceStart: number, sourceEnd: number, book: BibleBook, span: ParsedSpan): BibleReference {
  const draft = {
    bookId: book.id,
    chapterStart: span.chapterStart,
    verseStart: span.verseStart,
    chapterEnd: span.chapterEnd,
    verseEnd: span.verseEnd,
  };
  const validation = validateBibleReference(draft);
  const issues = [...span.issues, ...validation.issues];
  const status = validation.status === "valid" && span.issues.length > 0 ? "needs-review" : validation.status;

  return {
    raw: source.slice(sourceStart, sourceEnd),
    normalized: normalizeBibleReference(draft),
    sourceStart,
    sourceEnd,
    ...draft,
    confidence: status === "valid" ? span.confidence : Math.min(span.confidence, 0.72),
    status,
    issues,
  };
}

function aliasToPattern(alias: string): string {
  return alias
    .split(/\s+/)
    .map((part) => escapeRegExp(part))
    .join("\\s*");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findAliasEntry(rawAlias: string): AliasEntry | undefined {
  const normalized = normalizeAlias(rawAlias);
  return aliasEntries.find((entry) => normalizeAlias(entry.alias) === normalized);
}

function normalizeAlias(value: string): string {
  return value.toLowerCase().replace(/\./g, "").replace(/\s+/g, "");
}

function hasBoundaryBefore(source: string, index: number): boolean {
  if (index === 0) {
    return true;
  }

  return !/[A-Za-z0-9]/.test(source[index - 1]);
}

function skipSpaces(source: string, offset: number): number {
  let cursor = offset;
  while (/\s/.test(source[cursor] ?? "")) {
    cursor += 1;
  }
  return cursor;
}

function nextSeparator(source: string, offset: number): { value: string; end: number } | null {
  const cursor = skipSpaces(source, offset);
  const value = source[cursor];
  if (value === "," || value === ";") {
    return { value, end: cursor + 1 };
  }

  return null;
}
