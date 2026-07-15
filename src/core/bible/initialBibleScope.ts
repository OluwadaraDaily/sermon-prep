export const initialBibleScope = {
  language: "en",
  languageName: "English",
  canon: "protestant-66",
  canonName: "66-book Protestant canon",
  bookCount: 66,
  translationId: "web",
  translationName: "World English Bible",
  sourceEditionId: "engwebp",
} as const;

export type InitialBibleScope = typeof initialBibleScope;
