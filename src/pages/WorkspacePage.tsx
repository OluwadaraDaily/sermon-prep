import { NotesPane } from "../components/workspace/NotesPane";
import { ReviewPane } from "../components/workspace/ReviewPane";
import { WorkspaceHeader } from "../components/workspace/WorkspaceHeader";
import { WorkspaceIntro } from "../components/workspace/WorkspaceIntro";
import { useWorkspace } from "../features/workspace/useWorkspace";

export function WorkspacePage() {
  const workspace = useWorkspace();

  return (
    <div className="workspace-page">
      <WorkspaceHeader />
      <main className="workspace-shell">
        <WorkspaceIntro />
        <div className="workspace-grid">
          <NotesPane
            notes={workspace.notes}
            onFindPassages={workspace.findPassages}
            onNotesChange={workspace.setNotes}
            statusMessage={workspace.statusMessage}
          />
          <ReviewPane
            fileName={workspace.fileName}
            isDownloadingPdf={workspace.isDownloadingPdf}
            mode={workspace.mode}
            onDownloadPdf={workspace.downloadPassagesPdf}
            onFileNameChange={workspace.setFileName}
            onModeChange={workspace.setMode}
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
