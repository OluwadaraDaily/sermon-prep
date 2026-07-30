import crossReferenceJson from "../../../data/cross-references/openbible.json";
import { normalizeBibleReference } from "./catalog";
import type { Passage, RelatedPassage } from "./types";
type CrossReferenceEntry = {
  target: string;
  score: number;
};
type CrossReferenceDataset = {
  references: Record<string, CrossReferenceEntry[]>;
};
const dataset = crossReferenceJson as CrossReferenceDataset;
export const localCrossReferenceProvider = {
  async getRelatedPassages(passage: Passage, limit = 5): Promise<RelatedPassage[]> {
    const relatedByKey = new Map<string, RelatedPassage>();
    for (const verse of passage.verses) {
      const sourceKey = `${verse.bookId}.${verse.chapter}.${verse.verse}`;
      const entries = dataset.references[sourceKey] ?? [];
      for (const entry of entries) {
        if (entry.score <= 0) continue;
        const related = parseRelatedPassage(entry.target, entry.score);
        if (!related) continue;
        const key = `${related.bookId}.${related.chapterStart}.${related.verseStart}-${related.chapterEnd}.${related.verseEnd}`;
        const existing = relatedByKey.get(key);
        if (!existing || related.score > existing.score) {
          relatedByKey.set(key, related);
        }
      }
    }
    return [...relatedByKey.values()]
      .sort(
        (left, right) =>
          right.score - left.score || left.normalized.localeCompare(right.normalized),
      )
      .slice(0, limit);
  },
};
function parseRelatedPassage(target: string, score: number): RelatedPassage | null {
  const match = /^([^.]+)\.(\d+)\.(\d+)(?:-([^.]+)\.(\d+)\.(\d+))?$/.exec(target);
  if (!match || (match[4] && match[1] !== match[4])) return null;
  const chapterStart = Number(match[2]);
  const verseStart = Number(match[3]);
  const chapterEnd = match[5] ? Number(match[5]) : chapterStart;
  const verseEnd = match[6] ? Number(match[6]) : verseStart;
  const normalized = normalizeBibleReference({
    bookId: match[1],
    chapterStart,
    verseStart,
    chapterEnd,
    verseEnd,
  });
  return {
    bookId: match[1],
    chapterStart,
    verseStart,
    chapterEnd,
    verseEnd,
    normalized,
    score,
  };
}
