import { ArrowIcon } from "../common/Icons";

interface NotesPaneProps {
  notes: string;
  onFindPassages: () => Promise<void>;
  onNotesChange: (value: string) => void;
  statusMessage: string;
}

export function NotesPane({
  notes,
  onFindPassages,
  onNotesChange,
  statusMessage,
}: NotesPaneProps) {
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
      <textarea
        aria-label="Sermon notes"
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Paste notes with references like John 3:16; Psalm 23:1–4, or 1 Corinthians 13:4–7."
        rows={18}
        value={notes}
      />
      <div className="notes-footer">
        <p className="status-line" role="status" aria-live="polite">
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
