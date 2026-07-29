/* global console, process, URL */

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const defaultArchivePath = "/tmp/sermon-prep-openbible-cross-references.zip";
const archivePath =
  process.argv.find(
    (argument) =>
      !argument.startsWith("--") &&
      argument !== process.argv[0] &&
      argument !== process.argv[1],
  ) ?? defaultArchivePath;
const jsonOutput = process.argv.includes("--json");
const books = JSON.parse(
  readFileSync(new URL("../data/bibles/web/books.json", import.meta.url), "utf8"),
);

const bookTokenMap = new Map();
for (const book of books) {
  for (const token of [book.name, book.code, ...book.aliases]) {
    bookTokenMap.set(normalizeBookToken(token), book);
  }
}

function normalizeBookToken(token) {
  return token.toLowerCase().replace(/[.\s]/g, "");
}

function readArchiveText(filePath) {
  if (filePath.toLowerCase().endsWith(".zip")) {
    return execFileSync("unzip", ["-p", filePath, "cross_references.txt"], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  }

  return readFileSync(filePath, "utf8");
}

function parseVerseReference(value, lineNumber) {
  const match = /^(.*?)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) {
    return { error: `Invalid verse reference "${value}".` };
  }

  const book = bookTokenMap.get(normalizeBookToken(match[1]));
  if (!book) {
    return { error: `Unknown book token "${match[1]}".` };
  }

  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  const chapterInfo = book.chapters[chapter - 1];
  if (!chapterInfo) {
    return { error: `${book.name} has no chapter ${chapter}.` };
  }
  if (verse < 1 || verse > chapterInfo.verseCount) {
    return {
      error: `${book.name} ${chapter} has verses 1-${chapterInfo.verseCount}; verse ${verse} is invalid.`,
    };
  }

  return {
    value: {
      bookId: book.id,
      chapter,
      verse,
    },
    lineNumber,
  };
}

function parseTargetReference(value, lineNumber) {
  const rangeSeparator = value.indexOf("-");
  const startText = rangeSeparator === -1 ? value : value.slice(0, rangeSeparator);
  const endText = rangeSeparator === -1 ? value : value.slice(rangeSeparator + 1);
  const start = parseVerseReference(startText, lineNumber);
  if (start.error) return start;

  const end = parseVerseReference(endText, lineNumber);
  if (end.error) return end;

  if (
    start.value.bookId !== end.value.bookId ||
    end.value.chapter < start.value.chapter ||
    (end.value.chapter === start.value.chapter && end.value.verse < start.value.verse)
  ) {
    return { error: `Invalid target range "${value}".` };
  }

  return {
    value: {
      bookId: start.value.bookId,
      chapter: start.value.chapter,
      verseStart: start.value.verse,
      chapterEnd: end.value.chapter,
      verseEnd: end.value.verse,
    },
    lineNumber,
  };
}

function parseRecord(line, lineNumber) {
  const fields = line.split("\t");
  if (fields.length < 3) {
    return { error: "Expected tab-separated From Verse, To Verse, and Votes fields." };
  }

  const source = parseVerseReference(fields[0], lineNumber);
  if (source.error) return source;

  const target = parseTargetReference(fields[1], lineNumber);
  if (target.error) return target;

  const votes = Number(fields[2]);
  if (!Number.isInteger(votes)) {
    return { error: `Invalid vote count "${fields[2]}".` };
  }

  return {
    value: {
      source: source.value,
      target: target.value,
      score: votes,
      votes,
      relationship: "related",
      sourceName: "openbible",
    },
    lineNumber,
  };
}

function referenceKey(reference) {
  return `${reference.bookId}.${reference.chapter}.${reference.verseStart ?? reference.verse}`;
}

function targetKey(target) {
  return `${target.bookId}.${target.chapter}.${target.verseStart}-${target.chapterEnd}.${target.verseEnd}`;
}

function matchesTarget(target, expected) {
  return (
    target.bookId === expected.bookId &&
    target.chapter === expected.chapter &&
    target.verseStart === expected.verseStart &&
    target.chapterEnd === expected.chapterEnd &&
    target.verseEnd === expected.verseEnd
  );
}

function findExample(records, label, source, expectedTarget) {
  const sourceRecords = records.filter(
    (record) => referenceKey(record.source) === referenceKey(source),
  );
  const matches = sourceRecords.filter((record) =>
    matchesTarget(record.target, expectedTarget),
  );

  return {
    label,
    source,
    expectedTarget,
    status:
      matches.length > 0
        ? "present"
        : sourceRecords.length > 0
          ? "source-present-target-not-found"
          : "source-not-found",
    matchingRecords: matches,
    relatedRecordCount: sourceRecords.length,
  };
}

function classifyError(error) {
  if (error.startsWith("Invalid target range"))
    return "cross-book-or-reversed-target-range";
  if (error.includes("has no chapter")) return "catalog-chapter-mismatch";
  if (error.includes("has verses")) return "catalog-verse-mismatch";
  if (error.startsWith("Unknown book token")) return "unknown-book-token";
  if (error.startsWith("Invalid verse reference")) return "invalid-verse-format";
  if (error.startsWith("Invalid vote count")) return "invalid-vote-format";
  return "other";
}

function buildReport(sourcePath, sourceText, records, errors) {
  const sourceBooks = new Set(records.map((record) => record.source.bookId));
  const targetBooks = new Set(records.map((record) => record.target.bookId));
  const targetRanges = records.filter(
    (record) =>
      record.target.chapter !== record.target.chapterEnd ||
      record.target.verseStart !== record.target.verseEnd,
  );
  const invalidReasonCounts = errors.reduce((counts, error) => {
    const reason = classifyError(error.error);
    counts[reason] = (counts[reason] ?? 0) + 1;
    return counts;
  }, {});
  const examples = [
    findExample(
      records,
      "Matthew 4:4 to Deuteronomy 8:3",
      { bookId: "matthew", chapter: 4, verse: 4 },
      { bookId: "deuteronomy", chapter: 8, verseStart: 3, chapterEnd: 8, verseEnd: 3 },
    ),
    findExample(
      records,
      "Romans 4:3 to Genesis 15:6",
      { bookId: "romans", chapter: 4, verse: 3 },
      { bookId: "genesis", chapter: 15, verseStart: 6, chapterEnd: 15, verseEnd: 6 },
    ),
    findExample(
      records,
      "Hebrews 1:5 to Psalm 2:7",
      { bookId: "hebrews", chapter: 1, verse: 5 },
      { bookId: "psalms", chapter: 2, verseStart: 7, chapterEnd: 2, verseEnd: 7 },
    ),
  ];

  return {
    source: {
      path: sourcePath,
      byteSize: statSync(sourcePath).size,
      archiveFormat: sourcePath.toLowerCase().endsWith(".zip")
        ? "zip containing cross_references.txt"
        : "tab-separated text",
      header: sourceText.split(/\r?\n/, 1)[0],
    },
    catalog: {
      bookCount: books.length,
      sourceBookCount: sourceBooks.size,
      targetBookCount: targetBooks.size,
      missingSourceBooks: books
        .filter((book) => !sourceBooks.has(book.id))
        .map((book) => book.id),
      missingTargetBooks: books
        .filter((book) => !targetBooks.has(book.id))
        .map((book) => book.id),
    },
    records: {
      inputLineCount: sourceText.split(/\r?\n/).filter(Boolean).length,
      normalizedRecordCount: records.length,
      invalidRecordCount: errors.length,
      distinctRecordCount: new Set(
        records.map(
          (record) => `${referenceKey(record.source)}>${targetKey(record.target)}`,
        ),
      ).size,
      targetRangeCount: targetRanges.length,
      minimumScore: records.reduce(
        (minimum, record) => Math.min(minimum, record.score),
        Number.POSITIVE_INFINITY,
      ),
      maximumScore: records.reduce(
        (maximum, record) => Math.max(maximum, record.score),
        Number.NEGATIVE_INFINITY,
      ),
      invalidReasonCounts,
    },
    sampleRecord: records[0] ?? null,
    examples,
    errors: errors.slice(0, 20),
  };
}

function renderMarkdown(report) {
  const exampleLines = report.examples.map((example) => {
    const matchingVotes =
      example.matchingRecords.map((record) => record.votes).join(", ") || "—";
    return `| ${example.label} | ${example.status} | ${example.relatedRecordCount} | ${matchingVotes} |`;
  });

  return `# OpenBible Cross-Reference Validation

Generated by \`scripts/validate-openbible-cross-references.mjs\`.

## Source

- Archive: \`${report.source.path}\`
- Format: ${report.source.archiveFormat}
- Header: \`${report.source.header}\`
- Archive size: ${report.source.byteSize} bytes
- Source attribution: OpenBible.info cross-reference data, CC BY, archive dated 2026-07-27.

## Normalization

- Input rows: ${report.records.inputLineCount}
- Normalized records: ${report.records.normalizedRecordCount}
- Distinct records: ${report.records.distinctRecordCount}
- Invalid rows: ${report.records.invalidRecordCount}
- Target ranges: ${report.records.targetRangeCount}
- Score range: ${report.records.minimumScore}-${report.records.maximumScore} votes
- Invalid-row reasons: ${
    Object.entries(report.records.invalidReasonCounts)
      .map(([reason, count]) => `${reason}=${count}`)
      .join(", ") || "none"
  }
- First normalized record:

\`\`\`json
${JSON.stringify(report.sampleRecord, null, 2)}
\`\`\`

## Catalog coverage

- Existing WEB catalog books: ${report.catalog.bookCount}
- Books used as sources: ${report.catalog.sourceBookCount}
- Books used as targets: ${report.catalog.targetBookCount}
- Missing source books: ${report.catalog.missingSourceBooks.length > 0 ? report.catalog.missingSourceBooks.join(", ") : "none"}
- Missing target books: ${report.catalog.missingTargetBooks.length > 0 ? report.catalog.missingTargetBooks.join(", ") : "none"}

## Known examples

| Example | Status | Related records from source | Matching votes |
| --- | --- | ---: | ---: |
${exampleLines.join("\n")}

The dataset records these as related links. It does not provide a reliable relationship type that would justify displaying every link as a direct quotation or explicit citation.

## Errors

${report.errors.length === 0 ? "No invalid rows found." : report.errors.map((error) => `- line ${error.lineNumber}: ${error.error}`).join("\n")}
`;
}

const sourceText = readArchiveText(archivePath);
const lines = sourceText.split(/\r?\n/).filter(Boolean);
const header = lines.shift();
const errors = [];
const records = [];

if (!header?.startsWith("From Verse\tTo Verse\tVotes\t#www.openbible.info CC-BY ")) {
  errors.push({ lineNumber: 1, error: `Unexpected header: ${header ?? "missing"}.` });
}

for (const [index, line] of lines.entries()) {
  const parsed = parseRecord(line, index + 2);
  if (parsed.error) {
    errors.push({ lineNumber: index + 2, error: parsed.error });
  } else {
    records.push(parsed.value);
  }
}

const report = buildReport(archivePath, sourceText, records, errors);
console.log(jsonOutput ? JSON.stringify(report, null, 2) : renderMarkdown(report));
