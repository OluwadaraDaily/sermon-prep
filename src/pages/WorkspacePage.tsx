import { useState } from "react";

import { NotesPane } from "../components/workspace/NotesPane";
import { ReviewPane } from "../components/workspace/ReviewPane";
import { WorkspaceHeader } from "../components/workspace/WorkspaceHeader";
import { WorkspaceIntro } from "../components/workspace/WorkspaceIntro";
import { useWorkspace } from "../features/workspace/useWorkspace";

export function WorkspacePage() {
  const workspace = useWorkspace();
  const [activeReferenceId, setActiveReferenceId] = useState<string | null>(null);

  function handleReferenceActivate(id: string) {
    setActiveReferenceId(id);
  }

  function handleReferenceDeactivate() {
    setActiveReferenceId(null);
  }

  return (
    <div className="workspace-page">
      <WorkspaceHeader />
      <main className="workspace-shell">
        <WorkspaceIntro />
        <div className="workspace-grid">
          <NotesPane
            activeReferenceId={activeReferenceId}
            notes={workspace.notes}
            onFindPassages={workspace.findPassages}
            onReferenceActivate={handleReferenceActivate}
            onReferenceDeactivate={handleReferenceDeactivate}
            onNotesChange={workspace.setNotes}
            references={workspace.references}
            statusMessage={workspace.statusMessage}
          />
          <ReviewPane
            activeReferenceId={activeReferenceId}
            fileName={workspace.fileName}
            isDownloadingPdf={workspace.isDownloadingPdf}
            mode={workspace.mode}
            onDownloadPdf={workspace.downloadPassagesPdf}
            onFileNameChange={workspace.setFileName}
            onModeChange={workspace.setMode}
            onReferenceActivate={handleReferenceActivate}
            onReferenceDeactivate={handleReferenceDeactivate}
            onReferenceRemove={workspace.removeReference}
            onReferenceStatusChange={workspace.changeReferenceStatus}
            onReferenceTextBlur={workspace.validateReferenceText}
            onReferenceTextChange={workspace.changeReferenceText}
            passages={workspace.passages}
            references={workspace.references}
          />
        </div>
      </main>
    </div>
  );
}
