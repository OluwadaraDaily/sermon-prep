import type {
  BibleReference,
  Passage,
  ReferenceStatus,
  RelatedPassage,
} from "../../core/bible/types";

interface ReferenceRowProps {
  activeReferenceId: string | null;
  index: number;
  onReferenceActivate: (id: string) => void;
  onReferenceDeactivate: () => void;
  onRemove: (index: number) => void;
  onStatusChange: (index: number, status: ReferenceStatus) => void;
  onTextBlur: (index: number) => void;
  onTextChange: (index: number, value: string) => void;
  passage?: Passage;
  relatedPassages: RelatedPassage[];
  reference: BibleReference;
}

function RelatedPassages({
  passages,
  referenceId,
}: {
  passages: RelatedPassage[];
  referenceId: string;
}) {
  return (
    <section className="related-passages" aria-labelledby={`related-${referenceId}`}>
      <h3 id={`related-${referenceId}`}>Related passages</h3>
      <ul>
        {passages.map((passage) => (
          <li key={passage.normalized}>{passage.normalized}</li>
        ))}
      </ul>
      <p>Ranked from the local OpenBible cross-reference data.</p>
    </section>
  );
}

export function ReferenceRow({
  activeReferenceId,
  index,
  onReferenceActivate,
  onReferenceDeactivate,
  onRemove,
  onStatusChange,
  onTextBlur,
  onTextChange,
  passage,
  relatedPassages,
  reference,
}: ReferenceRowProps) {
  const isActive = activeReferenceId === reference.id;

  const handleOnBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (isActive && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onReferenceDeactivate();
    }
  };

  const handleOnMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (isActive && !event.currentTarget.contains(document.activeElement)) {
      onReferenceDeactivate();
    }
  };

  return (
    <article
      aria-current={isActive ? "true" : undefined}
      className={`reference-row${isActive ? " is-active" : ""}`}
      onBlur={handleOnBlur}
      onFocus={() => onReferenceActivate(reference.id)}
      onMouseEnter={() => onReferenceActivate(reference.id)}
      onMouseLeave={handleOnMouseLeave}
    >
      <div className="reference-edit">
        <input
          aria-label={`Reference ${index + 1}`}
          onBlur={() => onTextBlur(index)}
          onChange={(event) => onTextChange(index, event.target.value)}
          value={reference.normalized}
        />
        <select
          aria-label={`Status for ${reference.normalized}`}
          onChange={(event) =>
            onStatusChange(index, event.target.value as ReferenceStatus)
          }
          value={reference.status}
        >
          <option value="valid">Valid</option>
          <option value="needs-review">Needs review</option>
          <option value="invalid">Invalid</option>
        </select>
        <button
          aria-label={`Remove ${reference.normalized}`}
          className="remove-button"
          data-cursor
          type="button"
          onClick={() => onRemove(index)}
        >
          Remove
        </button>
      </div>
      <p className={`status-pill ${reference.status}`}>{reference.status}</p>
      {reference.issues.length > 0 ? (
        <p className="issue-line">{reference.issues.join(" ")}</p>
      ) : null}
      {passage ? <PassagePreview passage={passage} /> : null}
      {relatedPassages.length > 0 ? (
        <RelatedPassages passages={relatedPassages} referenceId={reference.id} />
      ) : null}
    </article>
  );
}

function PassagePreview({ passage }: { passage: Passage }) {
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
