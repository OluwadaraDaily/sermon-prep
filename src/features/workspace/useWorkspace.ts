import { useMemo, useRef, useState } from "react";

import type { BibleReference, Passage, ReferenceStatus } from "../../core/bible/types";
import { buildPassagePdf, downloadPdf, type PdfExportMode } from "../../core/export/pdf";
import { localWebProvider } from "../../core/provider/localWebProvider";
import {
  parseBibleReferences,
  parseSingleBibleReference,
} from "../../core/references/parser";
import { isPassage, referenceKey, toPdfFileName } from "./workspaceUtils";

const initialStatusMessage = "Paste notes to find Bible references.";

export function useWorkspace() {
  const [notes, setNotes] = useState("");
  const [references, setReferences] = useState<BibleReference[]>([]);
  const [passages, setPassages] = useState<Record<string, Passage>>({});
  const [mode, setMode] = useState<PdfExportMode>("references-and-text");
  const [fileName, setFileName] = useState("sermon-passages");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState(initialStatusMessage);
  const refreshGenerationRef = useRef(0);

  const approvedPassages = useMemo(
    () =>
      references
        .filter((reference) => reference.status === "valid")
        .map((reference) => passages[referenceKey(reference)])
        .filter(isPassage),
    [passages, references],
  );

  async function refreshPassages(nextReferences: BibleReference[]) {
    // Increment generation to invalidate previous requests
    const currentGeneration = ++refreshGenerationRef.current;
    const nextPassages: Record<string, Passage> = {};
    const validReferences = nextReferences.filter((reference) => reference.status === "valid");

    await Promise.allSettled(
      validReferences.map(async (reference) => {
        try {
          const passage = await localWebProvider.getPassage("web", reference);
          // Only store if this generation is still current
          if (currentGeneration === refreshGenerationRef.current) {
            nextPassages[referenceKey(reference)] = passage;
          }
        } catch (error) {
          console.error(
            `Failed to fetch passage for ${referenceKey(reference)}:`,
            error,
          );
          // Continue with other passages
        }
      }),
    );

    // Only update if this generation is still current
    if (currentGeneration === refreshGenerationRef.current) {
      setPassages(nextPassages);
      return nextPassages;
    }
    return passages;
  }

  async function findPassages() {
    const parsed = parseBibleReferences(notes);
    setReferences(parsed);
    await refreshPassages(parsed);
    setStatusMessage(
      parsed.length === 1 ? "Found 1 reference." : `Found ${parsed.length} references.`,
    );
  }

  function updateReference(index: number, nextReference: BibleReference) {
    const nextReferences = references.map((reference, referenceIndex) =>
      referenceIndex === index ? nextReference : reference,
    );
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  function changeReferenceText(index: number, value: string) {
    const reference = references[index];
    if (!reference) return;

    // Clear cached passage when text changes
    const nextPassages = { ...passages };
    delete nextPassages[referenceKey(reference)];
    setPassages(nextPassages);

    setReferences(
      references.map((reference, referenceIndex) =>
        referenceIndex === index
          ? {
              ...reference,
              raw: value,
              normalized: value,
              status: "needs-review" as const,
              issues: ["Edited reference has not been validated yet."],
            }
          : reference,
      ),
    );
  }

  function validateReferenceText(index: number) {
    const reference = references[index];
    if (!reference) return;

    const parsed = parseSingleBibleReference(reference.normalized);
    if (parsed) {
      // Preserve the original id when updating with parsed reference
      updateReference(index, { ...parsed, id: reference.id });
    }
  }

  function changeReferenceStatus(index: number, status: ReferenceStatus) {
    const reference = references[index];
    if (!reference) return;

    // Prevent transitioning to valid if reference has validation issues
    if (
      status === "valid" &&
      reference.issues.some((issue) => issue === "Edited reference has not been validated yet.")
    ) {
      return;
    }

    const nextReferences = references.map((reference, referenceIndex) =>
      referenceIndex === index
        ? { ...reference, status, issues: status === "valid" ? [] : reference.issues }
        : reference,
    );
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  function removeReference(index: number) {
    const nextReferences = references.filter(
      (_, referenceIndex) => referenceIndex !== index,
    );
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  async function downloadPassagesPdf() {
    setIsDownloadingPdf(true);

    try {
      const currentPassages = await refreshPassages(references);
      const validPassages = references
        .filter((reference) => reference.status === "valid")
        .map(
          (reference) =>
            currentPassages[referenceKey(reference)] ?? passages[referenceKey(reference)],
        )
        .filter(isPassage);
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

  return {
    notes,
    setNotes,
    references,
    passages,
    mode,
    setMode,
    fileName,
    setFileName,
    isDownloadingPdf,
    statusMessage,
    findPassages,
    changeReferenceText,
    validateReferenceText,
    changeReferenceStatus,
    removeReference,
    downloadPassagesPdf,
  };
}

export type WorkspaceController = ReturnType<typeof useWorkspace>;
