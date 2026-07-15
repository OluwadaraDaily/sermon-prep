import { initialBibleScope } from "../core/bible/initialBibleScope";

export function App() {
  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="app-title">
        <div className="intro">
          <p className="eyebrow">Phase 0 foundation</p>
          <h1 id="app-title">Sermon Prep</h1>
          <p>
            Paste sermon notes, extract Bible references, and prepare reviewed passages
            for export.
          </p>
        </div>

        <form className="input-panel">
          <label htmlFor="sermon-text">Sermon text</label>
          <textarea
            id="sermon-text"
            name="sermon-text"
            rows={12}
            placeholder="Paste sermon notes here..."
            disabled
          />
          <button type="button" disabled>
            Find passages
          </button>
        </form>

        <aside className="status-panel" aria-label="Project scope">
          <h2>Initial scope</h2>
          <dl>
            <div>
              <dt>Language</dt>
              <dd>{initialBibleScope.languageName}</dd>
            </div>
            <div>
              <dt>Canon</dt>
              <dd>{initialBibleScope.canonName}</dd>
            </div>
            <div>
              <dt>Translation</dt>
              <dd>{initialBibleScope.translationName}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
