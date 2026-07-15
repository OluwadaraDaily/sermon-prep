/* global console, process */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const archivePath = process.argv[2] ?? "/tmp/engwebp_html.zip";

const books = [
  ["genesis", "Genesis", "GEN", ["Genesis", "Gen", "Ge", "Gn"]],
  ["exodus", "Exodus", "EXO", ["Exodus", "Exod", "Exo", "Ex"]],
  ["leviticus", "Leviticus", "LEV", ["Leviticus", "Lev", "Le"]],
  ["numbers", "Numbers", "NUM", ["Numbers", "Num", "Nu", "Nm", "Nb"]],
  ["deuteronomy", "Deuteronomy", "DEU", ["Deuteronomy", "Deut", "Dt", "Deu"]],
  ["joshua", "Joshua", "JOS", ["Joshua", "Josh", "Jos"]],
  ["judges", "Judges", "JDG", ["Judges", "Judg", "Jdg", "Jg"]],
  ["ruth", "Ruth", "RUT", ["Ruth", "Ru", "Rth"]],
  ["1-samuel", "1 Samuel", "1SA", ["1 Samuel", "1 Sam", "1 Sa", "1Samuel", "First Samuel", "I Samuel"]],
  ["2-samuel", "2 Samuel", "2SA", ["2 Samuel", "2 Sam", "2 Sa", "2Samuel", "Second Samuel", "II Samuel"]],
  ["1-kings", "1 Kings", "1KI", ["1 Kings", "1 Kgs", "1 Ki", "1Kings", "First Kings", "I Kings"]],
  ["2-kings", "2 Kings", "2KI", ["2 Kings", "2 Kgs", "2 Ki", "2Kings", "Second Kings", "II Kings"]],
  ["1-chronicles", "1 Chronicles", "1CH", ["1 Chronicles", "1 Chron", "1 Chr", "1 Ch", "1Chronicles", "First Chronicles", "I Chronicles"]],
  ["2-chronicles", "2 Chronicles", "2CH", ["2 Chronicles", "2 Chron", "2 Chr", "2 Ch", "2Chronicles", "Second Chronicles", "II Chronicles"]],
  ["ezra", "Ezra", "EZR", ["Ezra", "Ezr"]],
  ["nehemiah", "Nehemiah", "NEH", ["Nehemiah", "Neh", "Ne"]],
  ["esther", "Esther", "EST", ["Esther", "Esth", "Est"]],
  ["job", "Job", "JOB", ["Job", "Jb"]],
  ["psalms", "Psalms", "PSA", ["Psalms", "Psalm", "Ps", "Psa", "Pss"]],
  ["proverbs", "Proverbs", "PRO", ["Proverbs", "Prov", "Prv", "Pr"]],
  ["ecclesiastes", "Ecclesiastes", "ECC", ["Ecclesiastes", "Eccles", "Eccl", "Ecc", "Qoheleth"]],
  ["song-of-solomon", "Song of Solomon", "SNG", ["Song of Solomon", "Song of Songs", "Song", "Canticles", "Cant", "Sng", "SoS"]],
  ["isaiah", "Isaiah", "ISA", ["Isaiah", "Isa", "Is"]],
  ["jeremiah", "Jeremiah", "JER", ["Jeremiah", "Jer", "Je"]],
  ["lamentations", "Lamentations", "LAM", ["Lamentations", "Lam", "La"]],
  ["ezekiel", "Ezekiel", "EZK", ["Ezekiel", "Ezek", "Ezk"]],
  ["daniel", "Daniel", "DAN", ["Daniel", "Dan", "Da", "Dn"]],
  ["hosea", "Hosea", "HOS", ["Hosea", "Hos", "Ho"]],
  ["joel", "Joel", "JOL", ["Joel", "Joe", "Jl"]],
  ["amos", "Amos", "AMO", ["Amos", "Am"]],
  ["obadiah", "Obadiah", "OBA", ["Obadiah", "Obad", "Ob"]],
  ["jonah", "Jonah", "JON", ["Jonah", "Jon", "Jnh"]],
  ["micah", "Micah", "MIC", ["Micah", "Mic", "Mc"]],
  ["nahum", "Nahum", "NAM", ["Nahum", "Nah", "Na"]],
  ["habakkuk", "Habakkuk", "HAB", ["Habakkuk", "Hab", "Hb"]],
  ["zephaniah", "Zephaniah", "ZEP", ["Zephaniah", "Zeph", "Zep"]],
  ["haggai", "Haggai", "HAG", ["Haggai", "Hag", "Hg"]],
  ["zechariah", "Zechariah", "ZEC", ["Zechariah", "Zech", "Zec"]],
  ["malachi", "Malachi", "MAL", ["Malachi", "Mal", "Ml"]],
  ["matthew", "Matthew", "MAT", ["Matthew", "Matt", "Mt"]],
  ["mark", "Mark", "MRK", ["Mark", "Mrk", "Mk"]],
  ["luke", "Luke", "LUK", ["Luke", "Luk", "Lk"]],
  ["john", "John", "JHN", ["John", "Jn", "Jhn"]],
  ["acts", "Acts", "ACT", ["Acts", "Act", "Ac"]],
  ["romans", "Romans", "ROM", ["Romans", "Rom", "Ro", "Rm"]],
  ["1-corinthians", "1 Corinthians", "1CO", ["1 Corinthians", "1 Cor", "1 Co", "1Corinthians", "First Corinthians", "I Corinthians"]],
  ["2-corinthians", "2 Corinthians", "2CO", ["2 Corinthians", "2 Cor", "2 Co", "2Corinthians", "Second Corinthians", "II Corinthians"]],
  ["galatians", "Galatians", "GAL", ["Galatians", "Gal", "Ga"]],
  ["ephesians", "Ephesians", "EPH", ["Ephesians", "Eph"]],
  ["philippians", "Philippians", "PHP", ["Philippians", "Phil", "Php", "Pp"]],
  ["colossians", "Colossians", "COL", ["Colossians", "Col"]],
  ["1-thessalonians", "1 Thessalonians", "1TH", ["1 Thessalonians", "1 Thess", "1 Thes", "1 Th", "1Thessalonians", "First Thessalonians", "I Thessalonians"]],
  ["2-thessalonians", "2 Thessalonians", "2TH", ["2 Thessalonians", "2 Thess", "2 Thes", "2 Th", "2Thessalonians", "Second Thessalonians", "II Thessalonians"]],
  ["1-timothy", "1 Timothy", "1TI", ["1 Timothy", "1 Tim", "1 Ti", "1Timothy", "First Timothy", "I Timothy"]],
  ["2-timothy", "2 Timothy", "2TI", ["2 Timothy", "2 Tim", "2 Ti", "2Timothy", "Second Timothy", "II Timothy"]],
  ["titus", "Titus", "TIT", ["Titus", "Tit", "Ti"]],
  ["philemon", "Philemon", "PHM", ["Philemon", "Phlm", "Phm"]],
  ["hebrews", "Hebrews", "HEB", ["Hebrews", "Heb"]],
  ["james", "James", "JAS", ["James", "Jas", "Jm"]],
  ["1-peter", "1 Peter", "1PE", ["1 Peter", "1 Pet", "1 Pe", "1Peter", "First Peter", "I Peter"]],
  ["2-peter", "2 Peter", "2PE", ["2 Peter", "2 Pet", "2 Pe", "2Peter", "Second Peter", "II Peter"]],
  ["1-john", "1 John", "1JN", ["1 John", "1 Jn", "1 Jo", "1John", "First John", "I John"]],
  ["2-john", "2 John", "2JN", ["2 John", "2 Jn", "2 Jo", "2John", "Second John", "II John"]],
  ["3-john", "3 John", "3JN", ["3 John", "3 Jn", "3 Jo", "3John", "Third John", "III John"]],
  ["jude", "Jude", "JUD", ["Jude", "Jud"]],
  ["revelation", "Revelation", "REV", ["Revelation", "Rev", "Revelations", "Apocalypse"]],
];

function unzipText(fileName) {
  return execFileSync("unzip", [
    "-p", 
    archivePath, 
    fileName], 
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 4 });
}

function decodeEntities(value) {
  return value
    .replace(/&#160;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripHtml(value) {
  return decodeEntities(
    value
      .replace(/<a\b[^>]*class="notemark"[\s\S]*?<\/a>/g, "")
      .replace(/<span class="popup">[\s\S]*?<\/span>/g, "")
      .replace(/<span\b[^>]*>/g, "")
      .replace(/<\/span>/g, "")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function extractVerses(html) {
  const parts = html.split(/<span class="verse" id="V(\d+)">\d+&#160;<\/span>/g);
  const verses = [];
  for (let index = 1; index < parts.length; index += 2) {
    const verse = Number(parts[index]);
    const text = stripHtml(parts[index + 1] ?? "");
    if (verse > 0 && text) {
      verses[verse - 1] = text;
    }
  }
  return verses;
}

const files = execFileSync("unzip", ["-Z1", archivePath], { encoding: "utf8" }).split(/\r?\n/);
const sourceChecksum = createHash("sha256").update(readFileSync(archivePath)).digest("hex");
const importedBooks = [];
const versesByBook = {};

for (const [id, name, code, aliases] of books) {
  const pattern = new RegExp(`^${code}(\\d{2,3})\\.htm$`);
  const chapterFiles = files
    .map((fileName) => {
      const match = pattern.exec(fileName);
      return match ? { fileName, chapter: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .filter(({ chapter }) => chapter > 0)
    .sort((a, b) => a.chapter - b.chapter);

  const chapters = [];
  versesByBook[id] = {};
  for (const { fileName, chapter } of chapterFiles) {
    const verses = extractVerses(unzipText(fileName));
    chapters.push({ chapter, verseCount: verses.length });
    versesByBook[id][String(chapter)] = verses;
  }

  importedBooks.push({ id, name, code, aliases, chapters });
}

writeFileSync("data/bibles/web/books.json", `${JSON.stringify(importedBooks, null, 2)}\n`);
writeFileSync("data/bibles/web/verses.json", `${JSON.stringify(versesByBook)}\n`);

const metadata = JSON.parse(readFileSync("data/bibles/web/metadata.json", "utf8"));
writeFileSync(
  "data/bibles/web/metadata.json",
  `${JSON.stringify(
    {
      ...metadata,
      sourceArchive: basename(archivePath),
      sourceArchiveUrl: "https://ebible.org/engwebp/engwebp_html.zip",
      sourceGeneratedFrom: "HTML generated by eBible.org/Haiola on 10 Jul 2026 from source files dated 10 Jul 2026.",
      importedAt: "2026-07-15",
      checksum: `sha256:${sourceChecksum}`,
      notes: "Imported from the official eBible.org World English Bible Protestant Edition offline HTML archive. Footnotes and navigation text are excluded from verse text.",
    },
    null,
    2
  )}\n`
);

console.log(`Imported ${importedBooks.length} books from ${archivePath}.`);
