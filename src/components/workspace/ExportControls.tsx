import type { PdfExportMode } from "../../core/export/pdf";
import { ExportIcon } from "../common/Icons";

interface ExportControlsProps {
  fileName: string;
  isDownloading: boolean;
  isDisabled: boolean;
  mode: PdfExportMode;
  onDownload: () => Promise<void>;
  onFileNameChange: (value: string) => void;
  onModeChange: (mode: PdfExportMode) => void;
}

export function ExportControls({
  fileName,
  isDownloading,
  isDisabled,
  mode,
  onDownload,
  onFileNameChange,
  onModeChange,
}: ExportControlsProps) {
  return (
    <div className="export-controls" role="group" aria-label="PDF export options">
      <label className="file-name-field">
        File name
        <input
          aria-label="PDF file name"
          onChange={(event) => onFileNameChange(event.target.value)}
          placeholder="sermon-passages"
          value={fileName}
        />
      </label>
      <div className="mode-fields">
        <label>
          <input
            checked={mode === "references"}
            name="mode"
            onChange={() => onModeChange("references")}
            type="radio"
          />
          References
        </label>
        <label>
          <input
            checked={mode === "references-and-text"}
            name="mode"
            onChange={() => onModeChange("references-and-text")}
            type="radio"
          />
          Text
        </label>
      </div>
      <button
        className="button button-outline"
        data-cursor
        disabled={isDisabled || isDownloading}
        type="button"
        onClick={onDownload}
      >
        {isDownloading ? "Preparing..." : "Download PDF"} <ExportIcon />
      </button>
    </div>
  );
}
