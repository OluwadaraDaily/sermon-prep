import { useEffect, useRef } from "react";

import type { BibleReference } from "../../core/bible/types";
import { buildNotesSegments } from "../../features/workspace/notesHighlight";
import { ArrowIcon } from "../common/Icons";

interface NotesPaneProps {
  activeReferenceId: string | null;
  notes: string;
  onFindPassages: () => Promise<void>;
  onNotesChange: (value: string) => void;
  references: BibleReference[];
  statusMessage: string;
}

export function NotesPane({
  activeReferenceId,
  notes,
  onFindPassages,
  onNotesChange,
  references,
  statusMessage,
}: NotesPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);
  const segments = buildNotesSegments(notes, references, activeReferenceId);

  function syncHighlightScroll() {
    const textarea = textareaRef.current;
    const highlightLayer = highlightLayerRef.current;
    if (!textarea || !highlightLayer) return;

    highlightLayer.style.transform = "";
    highlightLayer.scrollLeft = textarea.scrollLeft;
    highlightLayer.scrollTop = textarea.scrollTop;
  }

  useEffect(() => {
    syncHighlightScroll();
  }, [notes, activeReferenceId]);

  return (
    <section className="workspace-card notes-pane" aria-labelledby="notes-heading">
      <div className="workspace-card-heading">
        <div>
          <span className="card-index">01</span>
          <h2 id="notes-heading">Bring your notes</h2>
        </div>
        <span className="card-symbol">✦</span>
      </div>
      <p className="workspace-help">
        Paste a sermon summary, outline, or reading notes. We’ll gather the biblical
        threads for you.
      </p>
      <div className="notes-editor">
        <div aria-hidden="true" className="notes-highlight-layer" ref={highlightLayerRef}>
          {segments.map((segment, index) => (
            <span className={segment.isHighlighted ? "notes-highlight" : undefined} key={`${index}-${segment.text}`}>
              {segment.text}
            </span>
          ))}
        </div>
        <textarea
          aria-label="Sermon notes"
          onChange={(event) => onNotesChange(event.target.value)}
          onScroll={syncHighlightScroll}
          placeholder="Paste notes with references like John 3:16; Psalm 23:1–4, or 1 Corinthians 13:4–7."
          ref={textareaRef}
          rows={18}
          value={notes}
        />
      </div>
      <div className="notes-footer">
        <p className="status-line" role="status">
          <span className="status-dot" /> {statusMessage}
        </p>
        <button
          className="button button-dark"
          data-cursor
          onClick={onFindPassages}
          type="button"
        >
          Find passages <ArrowIcon />
        </button>
      </div>
    </section>
  );
}
