import type {
  BibleReference,
  Passage,
  ReferenceStatus,
  RelatedPassage,
} from "../../core/bible/types";
import type { RelatedPassagePreview } from "../../features/workspace/useWorkspace";
import { PassagePreview } from "./PassagePreview";
import { RelatedPassages } from "./RelatedPassages";

interface ReferenceRowProps {
  activeReferenceId: string | null;
  index: number;
  onReferenceActivate: (id: string) => void;
  onReferenceDeactivate: () => void;
  onRemove: (index: number) => void;
  onStatusChange: (index: number, status: ReferenceStatus) => void;
  onTextBlur: (index: number) => void;
  onTextChange: (index: number, value: string) => void;
  onRelatedPassageHover: (passage: RelatedPassage) => void;
  passage?: Passage;
  relatedPassagePreviews: Record<string, RelatedPassagePreview>;
  relatedPassages: RelatedPassage[];
  reference: BibleReference;
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
  onRelatedPassageHover,
  passage,
  relatedPassages,
  relatedPassagePreviews,
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
        <RelatedPassages
          onPassageHover={onRelatedPassageHover}
          passages={relatedPassages}
          previews={relatedPassagePreviews}
          referenceId={reference.id}
        />
      ) : null}
    </article>
  );
}
