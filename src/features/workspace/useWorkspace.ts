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
  const refreshGeneration = useRef(0);
  const editedReferenceIds = useRef(new Set<string>());

  const approvedPassages = useMemo(
    () =>
      references
        .filter((reference) => reference.status === "valid")
        .map((reference) => passages[referenceKey(reference)])
        .filter(isPassage),
    [passages, references],
  );

  async function refreshPassages(nextReferences: BibleReference[]) {
    const requestGeneration = refreshGeneration.current + 1;
    refreshGeneration.current = requestGeneration;
    const nextPassages: Record<string, Passage> = {};

    const results = await Promise.allSettled(
      nextReferences
        .filter((reference) => reference.status === "valid")
        .map(async (reference) => ({
          key: referenceKey(reference),
          passage: await localWebProvider.getPassage("web", reference),
        })),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        nextPassages[result.value.key] = result.value.passage;
      }
    }

    const failedCount = results.filter((result) => result.status === "rejected").length;
    const isCurrent = requestGeneration === refreshGeneration.current;

    if (isCurrent) {
      setPassages(nextPassages);
      if (failedCount > 0) {
        setStatusMessage(
          failedCount === 1
            ? "One passage could not be loaded. Please review the reference."
            : `${failedCount} passages could not be loaded. Please review the references.`,
        );
      }
    }

    return { failedCount, isCurrent, passages: nextPassages };
  }

  async function findPassages() {
    const parsed = parseBibleReferences(notes);
    setReferences(parsed);
    editedReferenceIds.current.clear();
    const refreshResult = await refreshPassages(parsed);
    if (!refreshResult.isCurrent) return;

    const foundMessage =
      parsed.length === 1 ? "Found 1 reference." : `Found ${parsed.length} references.`;
    setStatusMessage(
      refreshResult.failedCount > 0
        ? `${foundMessage} Some passages could not be loaded.`
        : foundMessage,
    );
  }

  function updateReference(index: number, nextReference: BibleReference) {
    const currentReference = references[index];
    if (!currentReference) return;

    const preservedReference = { ...nextReference, id: currentReference.id };
    if (preservedReference.status === "valid") {
      editedReferenceIds.current.delete(currentReference.id);
    }

    const nextReferences = references.map((reference, referenceIndex) =>
      referenceIndex === index ? preservedReference : reference,
    );
    setReferences(nextReferences);
    void refreshPassages(nextReferences);
  }

  function changeReferenceText(index: number, value: string) {
    const currentReference = references[index];
    if (!currentReference) return;

    editedReferenceIds.current.add(currentReference.id);
    refreshGeneration.current += 1;
    setPassages((currentPassages) => {
      const nextPassages = { ...currentPassages };
      delete nextPassages[referenceKey(currentReference)];
      return nextPassages;
    });
    setReferences((currentReferences) =>
      currentReferences.map((reference, referenceIndex) =>
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
    if (parsed) updateReference(index, parsed);
  }

  function changeReferenceStatus(index: number, status: ReferenceStatus) {
    const currentReference = references[index];
    if (!currentReference) return;
    if (status === "valid" && editedReferenceIds.current.has(currentReference.id)) return;

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
      const refreshResult = await refreshPassages(references);
      const currentPassages = refreshResult.passages;
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
