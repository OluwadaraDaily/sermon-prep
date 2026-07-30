import type { Passage } from "../../core/bible/types";

export function PassagePreview({ passage }: { passage: Passage }) {
  return (
    <blockquote>
      {passage.verses.slice(0, 4).map((verse) => (
        <p key={`${verse.chapter}-${verse.verse}`}>
          <sup>
            {verse.chapter}:{verse.verse}
          </sup>{" "}
          {verse.text}
        </p>
      ))}
      {passage.verses.length > 4 ? (
        <p className="more-line">
          {passage.verses.length - 4} more verses included in export.
        </p>
      ) : null}
    </blockquote>
  );
}
