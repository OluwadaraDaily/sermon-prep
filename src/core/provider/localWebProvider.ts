import metadataJson from "../../../data/bibles/web/metadata.json";
import versesJson from "../../../data/bibles/web/verses.json";
import { normalizeBibleReference, validateBibleReference } from "../bible/catalog";

import type { BibleProvider, BibleReference, BibleVersion, Passage, PassageVerse, ValidationResult } from "../bible/types";

type VerseData = Record<string, Record<string, string[]>>;

const verses = versesJson as VerseData;
const metadata = metadataJson as {
  id: string;
  name: string;
  language: string;
  sourceUrl: string;
};

export const localWebProvider: BibleProvider = {
  async listVersions(): Promise<BibleVersion[]> {
    return [
      {
        id: metadata.id,
        name: metadata.name,
        language: metadata.language,
        sourceUrl: metadata.sourceUrl,
      },
    ];
  },

  async validate(reference: BibleReference): Promise<ValidationResult> {
    return validateBibleReference(reference);
  },

  async getPassage(versionId: string, reference: BibleReference): Promise<Passage> {
    if (versionId !== metadata.id) {
      throw new Error(`Unsupported Bible version: ${versionId}.`);
    }

    const validation = validateBibleReference(reference);
    if (validation.status === "invalid") {
      throw new Error(`Cannot retrieve invalid reference ${reference.normalized}: ${validation.issues.join(" ")}`);
    }

    return {
      reference,
      versionId,
      versionName: metadata.name,
      normalized: normalizeBibleReference(reference),
      verses: collectVerses(reference),
    };
  },
};

function collectVerses(reference: BibleReference): PassageVerse[] {
  const collected: PassageVerse[] = [];

  for (let chapter = reference.chapterStart; chapter <= reference.chapterEnd; chapter += 1) {
    const chapterVerses = verses[reference.bookId]?.[String(chapter)];
    if (!chapterVerses) {
      continue;
    }

    const startVerse = chapter === reference.chapterStart && reference.verseStart !== null ? reference.verseStart : 1;
    const endVerse =
      chapter === reference.chapterEnd && reference.verseEnd !== null ? reference.verseEnd : chapterVerses.length;

    for (let verse = startVerse; verse <= endVerse; verse += 1) {
      const text = chapterVerses[verse - 1];
      if (text) {
        collected.push({ bookId: reference.bookId, chapter, verse, text });
      }
    }
  }

  return collected;
}
