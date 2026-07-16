import { useMemo, useState } from "react";

import { buildPassagePdf, downloadPdf, type PdfExportMode } from "../core/export/pdf";
import { localWebProvider } from "../core/provider/localWebProvider";
import { parseBibleReferences, parseSingleBibleReference } from "../core/references/parser";

import type { BibleReference, Passage, ReferenceStatus } from "../core/bible/types";

export function App() {
  const [notes, setNotes] = useState("");
  const [references, setReferences] = useState<BibleReference[]>([]);
  const [passages, setPassages] = useState<Record<string, Passage>>({});
  const [mode, setMode] = useState<PdfExportMode>("references-and-text");
  const [fileName, setFileName] = useState("sermon-passages");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Paste notes to find Bible references.");

  const approvedPassages = useMemo(
    () =>
      references
        .filter((reference) => reference.status === "valid")
        .map((reference) => passages[referenceKey(reference)])
        .filter(Boolean),
    [passages, references]
  );

  async function handleFindPassages() {
    const parsed = parseBibleReferences(notes);
    setReferences(parsed);
    await refreshPassages(parsed);
    setStatusMessage(parsed.length === 1 ? "Found 1 reference." : `Found ${parsed.length} references.`);
  }

  async function refreshPassages(nextReferences: BibleReference[]) {
    const nextPassages: Record<string, Passage> = {};

    await Promise.all(
      nextReferences
        .filter((reference) => reference.status === "valid")
        .map(async (reference) => {
          nextPassages[referenceKey(reference)] = await localWebProvider.getPassage("web", reference);
        })
    );

    setPassages(nextPassages);
    return nextPassages;
  }

  function updateReference(index: number, nextReference: BibleReference) {
    const nextReferences = references.map((reference, referenceIndex) => (referenceIndex === index ? nextReference : reference));
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  function handleReferenceTextChange(index: number, value: string) {
    const nextReferences = references.map((reference, referenceIndex) =>
      referenceIndex === index
        ? {
            ...reference,
            raw: value,
            normalized: value,
            status: "needs-review" as const,
            issues: ["Edited reference has not been validated yet."],
          }
        : reference
    );
    setReferences(nextReferences);
  }

  function handleReferenceTextBlur(index: number) {
    const reference = references[index];
    const parsed = parseSingleBibleReference(reference.normalized);
    if (parsed) {
      updateReference(index, parsed);
    }
  }

  function handleStatusChange(index: number, status: ReferenceStatus) {
    const nextReferences = references.map((reference, referenceIndex) =>
      referenceIndex === index ? { ...reference, status, issues: status === "valid" ? [] : reference.issues } : reference
    );
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  function handleRemoveReference(index: number) {
    const nextReferences = references.filter((_, referenceIndex) => referenceIndex !== index);
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);

    try {
      const currentPassages = await refreshPassages(references);
      const validPassages = references
        .filter((reference) => reference.status === "valid")
        .map((reference) => currentPassages[referenceKey(reference)] ?? passages[referenceKey(reference)])
        .filter(Boolean);
      const bytes = await buildPassagePdf({
        title: "Sermon Passages",
        mode,
        passages: validPassages.length > 0 ? validPassages : approvedPassages,
      });
      downloadPdf(bytes, toPdfFileName(fileName));
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="notes-pane" aria-labelledby="notes-heading">
        <div className="pane-heading">
          <div>
            <p className="eyebrow">Sermon Prep</p>
            <h1 id="notes-heading">Scripture review</h1>
          </div>
          <button type="button" onClick={handleFindPassages}>
            Find passages
          </button>
        </div>
        <textarea
          aria-label="Sermon notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Paste sermon notes with references like John 3:16; 4:1-3, Ps 23:1, 4-6, or 1 Cor 13:4-7."
          rows={18}
          value={notes}
        />
        <p className="status-line">{statusMessage}</p>
      </section>

      <section className="review-pane" aria-labelledby="review-heading">
        <div className="pane-heading review-heading">
          <div>
            <p className="eyebrow">WEB local lookup</p>
            <h2 id="review-heading">Detected references</h2>
          </div>
          <div className="export-controls" role="group" aria-label="PDF export mode">
            <label className="file-name-field">
              File name
              <input
                aria-label="PDF file name"
                onChange={(event) => setFileName(event.target.value)}
                placeholder="sermon-passages"
                value={fileName}
              />
            </label>
            <div className="mode-fields">
              <label>
                <input checked={mode === "references"} name="mode" onChange={() => setMode("references")} type="radio" />
                References
              </label>
              <label>
                <input checked={mode === "references-and-text"} name="mode" onChange={() => setMode("references-and-text")} type="radio" />
                Text
              </label>
            </div>
            <button disabled={references.length === 0 || isDownloadingPdf} type="button" onClick={handleDownloadPdf}>
              {isDownloadingPdf ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="reference-list">
          {references.length === 0 ? (
            <p className="empty-state">No references found yet.</p>
          ) : (
            references.map((reference, index) => {
              const passage = passages[referenceKey(reference)];
              return (
                <article className="reference-row" key={`${reference.sourceStart}-${reference.normalized}`}>
                  <div className="reference-edit">
                    <input
                      aria-label={`Reference ${index + 1}`}
                      onBlur={() => handleReferenceTextBlur(index)}
                      onChange={(event) => handleReferenceTextChange(index, event.target.value)}
                      value={reference.normalized}
                    />
                    <select
                      aria-label={`Status for ${reference.normalized}`}
                      onChange={(event) => handleStatusChange(index, event.target.value as ReferenceStatus)}
                      value={reference.status}
                    >
                      <option value="valid">Valid</option>
                      <option value="needs-review">Needs review</option>
                      <option value="invalid">Invalid</option>
                    </select>
                    <button aria-label={`Remove ${reference.normalized}`} type="button" onClick={() => handleRemoveReference(index)}>
                      Remove
                    </button>
                  </div>
                  <p className={`status-pill ${reference.status}`}>{reference.status}</p>
                  {reference.issues.length > 0 ? <p className="issue-line">{reference.issues.join(" ")}</p> : null}
                  {passage ? (
                    <blockquote>
                      {passage.verses.slice(0, 4).map((verse) => (
                        <p key={`${verse.chapter}-${verse.verse}`}>
                          <sup>
                            {verse.chapter}:{verse.verse}
                          </sup>{" "}
                          {verse.text}
                        </p>
                      ))}
                      {passage.verses.length > 4 ? <p className="more-line">{passage.verses.length - 4} more verses included in export.</p> : null}
                    </blockquote>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

function referenceKey(reference: BibleReference): string {
  return [reference.bookId, reference.chapterStart, reference.verseStart ?? "", reference.chapterEnd, reference.verseEnd ?? ""].join("|");
}

function toPdfFileName(value: string): string {
  const cleaned = value
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9._ -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${cleaned || "sermon-passages"}.pdf`;
}
