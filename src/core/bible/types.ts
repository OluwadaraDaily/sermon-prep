export type ReferenceStatus = "valid" | "needs-review" | "invalid";

export type BibleReference = {
  raw: string;
  normalized: string;
  sourceStart: number;
  sourceEnd: number;
  bookId: string;
  chapterStart: number;
  verseStart: number | null;
  chapterEnd: number;
  verseEnd: number | null;
  confidence: number;
  status: ReferenceStatus;
  issues: string[];
};

export type BibleBookChapter = {
  chapter: number;
  verseCount: number;
};

export type BibleBook = {
  id: string;
  name: string;
  code: string;
  aliases: string[];
  chapters: BibleBookChapter[];
};

export type BibleVersion = {
  id: string;
  name: string;
  language: string;
  sourceUrl: string;
};

export type ValidationResult = {
  status: ReferenceStatus;
  issues: string[];
};

export type PassageVerse = {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
};

export type Passage = {
  reference: BibleReference;
  versionId: string;
  versionName: string;
  normalized: string;
  verses: PassageVerse[];
};

export interface BibleProvider {
  listVersions(): Promise<BibleVersion[]>;
  validate(reference: BibleReference): Promise<ValidationResult>;
  getPassage(versionId: string, reference: BibleReference): Promise<Passage>;
}
