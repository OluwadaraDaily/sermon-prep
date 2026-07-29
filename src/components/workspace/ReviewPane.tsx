import type {
  BibleReference,
  Passage,
  ReferenceStatus,
  RelatedPassage,
} from "../../core/bible/types";
import type { PdfExportMode } from "../../core/export/pdf";
import { referenceKey } from "../../features/workspace/workspaceUtils";
import { ExportControls } from "./ExportControls";
import { ReferenceRow } from "./ReferenceRow";

interface ReviewPaneProps {
  activeReferenceId: string | null;
  fileName: string;
  isDownloadingPdf: boolean;
  mode: PdfExportMode;
  onDownloadPdf: () => Promise<void>;
  onFileNameChange: (value: string) => void;
  onModeChange: (mode: PdfExportMode) => void;
  onReferenceActivate: (id: string) => void;
  onReferenceDeactivate: () => void;
  onReferenceRemove: (index: number) => void;
  onReferenceStatusChange: (index: number, status: ReferenceStatus) => void;
  onReferenceTextBlur: (index: number) => void;
  onReferenceTextChange: (index: number, value: string) => void;
  passages: Record<string, Passage>;
  relatedPassages: Record<string, RelatedPassage[]>;
  references: BibleReference[];
}

export function ReviewPane({
  activeReferenceId,
  fileName,
  isDownloadingPdf,
  mode,
  onDownloadPdf,
  onFileNameChange,
  onModeChange,
  onReferenceActivate,
  onReferenceDeactivate,
  onReferenceRemove,
  onReferenceStatusChange,
  onReferenceTextBlur,
  onReferenceTextChange,
  passages,
  relatedPassages,
  references,
}: ReviewPaneProps) {
  return (
    <section className="workspace-card review-pane" aria-labelledby="review-heading">
      <div className="workspace-card-heading">
        <div>
          <span className="card-index">02</span>
          <h2 id="review-heading">Detected references</h2>
        </div>
        <span className="reference-count">
          {references.length > 0 ? `${references.length} found` : "Waiting"}
        </span>
      </div>

      <ExportControls
        fileName={fileName}
        isDisabled={!references.some((reference) => reference.status === "valid")}
        isDownloading={isDownloadingPdf}
        mode={mode}
        onDownload={onDownloadPdf}
        onFileNameChange={onFileNameChange}
        onModeChange={onModeChange}
      />

      <div className="reference-list">
        {references.length === 0 ? (
          <EmptyReferences />
        ) : (
          references.map((reference, index) => (
            <ReferenceRow
              activeReferenceId={activeReferenceId}
              index={index}
              key={reference.id}
              onReferenceActivate={onReferenceActivate}
              onReferenceDeactivate={onReferenceDeactivate}
              onRemove={onReferenceRemove}
              onStatusChange={onReferenceStatusChange}
              onTextBlur={onReferenceTextBlur}
              onTextChange={onReferenceTextChange}
              passage={passages[referenceKey(reference)]}
              relatedPassages={relatedPassages[referenceKey(reference)] ?? []}
              reference={reference}
            />
          ))
        )}
      </div>
    </section>
  );
}

function EmptyReferences() {
  return (
    <div className="empty-state">
      <span className="empty-symbol">◌</span>
      <strong>Your references will appear here.</strong>
      <p>Start by pasting notes on the left.</p>
    </div>
  );
}
