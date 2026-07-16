import { describe, expect, it } from "vitest";

import { bibleBooks } from "../bible/catalog";

import { parseBibleReferences } from "./parser";

const generatedFixtures = bibleBooks.flatMap((book) => [
  { input: `${book.name} 1:1`, expected: `${book.name} 1:1`, status: "valid" },
  { input: `${book.aliases[1] ?? book.aliases[0]} 1:1`, expected: `${book.name} 1:1`, status: "valid" },
]);

const targetedFixtures = [
  { input: "Read Genesis 1:1 today.", expected: "Genesis 1:1", status: "valid" },
  { input: "Gen. 1:1-3", expected: "Genesis 1:1-3", status: "valid" },
  { input: "Gn 1:1", expected: "Genesis 1:1", status: "valid" },
  { input: "Jn 3:16", expected: "John 3:16", status: "valid" },
  { input: "John 3:16-18", expected: "John 3:16-18", status: "valid" },
  { input: "John 3:36-4:2", expected: "John 3:36-4:2", status: "valid" },
  { input: "1 Cor 13:4-7", expected: "1 Corinthians 13:4-7", status: "valid" },
  { input: "First Corinthians 13:4", expected: "1 Corinthians 13:4", status: "valid" },
  { input: "Romans 8", expected: "Romans 8", status: "valid" },
  { input: "Rom. 8:1", expected: "Romans 8:1", status: "valid" },
  { input: "Psalm 23", expected: "Psalms 23", status: "valid" },
  { input: "Ps 23:1", expected: "Psalms 23:1", status: "valid" },
  { input: "Proverbs 3:5-6", expected: "Proverbs 3:5-6", status: "valid" },
  { input: "Song of Songs 2:1", expected: "Song of Solomon 2:1", status: "valid" },
  { input: "II Timothy 3:16", expected: "2 Timothy 3:16", status: "valid" },
  { input: "3 Jn 1:2", expected: "3 John 1:2", status: "valid" },
  { input: "Rev 22:21", expected: "Revelation 22:21", status: "valid" },
  { input: "Gen 1:31-2:3", expected: "Genesis 1:31-2:3", status: "valid" },
  { input: "Matthew 28:19-20", expected: "Matthew 28:19-20", status: "valid" },
  { input: "Jude 1:25", expected: "Jude 1:25", status: "valid" },
  { input: "John 3:99", expected: "John 3:99", status: "invalid" },
  { input: "Obadiah 2:1", expected: "Obadiah 2:1", status: "invalid" },
  { input: "Psalms 151", expected: "Psalms 151", status: "invalid" },
];

const fixtures = [...generatedFixtures, ...targetedFixtures];

describe("parseBibleReferences", () => {
  it("covers at least 150 parser fixtures", () => {
    expect(fixtures).toHaveLength(155);
  });

  it.each(fixtures)("parses $input", ({ input, expected, status }) => {
    const [reference] = parseBibleReferences(input);

    expect(reference.normalized).toBe(expected);
    expect(reference.status).toBe(status);
  });

  it("parses same-book chapter context after a semicolon", () => {
    const references = parseBibleReferences("John 3:16; 4:1-3");

    expect(references.map((reference) => reference.normalized)).toEqual(["John 3:16", "John 4:1-3"]);
  });

  it("does not swallow numbered book aliases after a comma", () => {
    const references = parseBibleReferences("John 7, John 10, 1Cor. 10:10-15");

    expect(references.map((reference) => reference.normalized)).toEqual([
      "John 7",
      "John 10",
      "1 Corinthians 10:10-15",
    ]);
  });

  it("surfaces book-only numbered aliases for review", () => {
    const references = parseBibleReferences("1 Cor, 2 Tim");

    expect(references.map((reference) => reference.normalized)).toEqual(["1 Corinthians", "2 Timothy"]);
    expect(references.map((reference) => reference.status)).toEqual(["needs-review", "needs-review"]);
  });

  it("does not match non-numbered book aliases without a chapter", () => {
    const references = parseBibleReferences("We talked about John and Romans.");

    expect(references).toEqual([]);
  });

  it("parses verse lists from the current chapter", () => {
    const references = parseBibleReferences("Ps 23:1, 4-6");

    expect(references.map((reference) => reference.normalized)).toEqual(["Psalms 23:1", "Psalms 23:4-6"]);
    expect(references[1].status).toBe("needs-review");
  });

  it("deduplicates while preserving first-seen order", () => {
    const references = parseBibleReferences("John 3:16, Jn 3:16, Romans 8:1");

    expect(references.map((reference) => reference.normalized)).toEqual(["John 3:16", "Romans 8:1"]);
  });

  it("preserves source positions and raw text", () => {
    const source = "Opening text: Gen. 1:1-3.";
    const [reference] = parseBibleReferences(source);

    expect(reference.raw).toBe("Gen. 1:1-3");
    expect(source.slice(reference.sourceStart, reference.sourceEnd)).toBe(reference.raw);
  });
});
