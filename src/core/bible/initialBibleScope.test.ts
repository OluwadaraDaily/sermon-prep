import { initialBibleScope } from "./initialBibleScope";

describe("initialBibleScope", () => {
  it("starts with the agreed 66-book English WEB scope", () => {
    expect(initialBibleScope).toMatchObject({
      language: "en",
      canon: "protestant-66",
      bookCount: 66,
      translationId: "web",
      sourceEditionId: "engwebp",
    });
  });
});
