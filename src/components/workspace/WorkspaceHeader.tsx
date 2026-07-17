import { Link } from "react-router-dom";

import { Brand } from "../common/Brand";
import { ArrowUpIcon } from "../common/Icons";

export function WorkspaceHeader() {
  return (
    <header className="workspace-topbar">
      <Brand />
      <div className="workspace-breadcrumb">
        <span>Workspace</span>
        <i>/</i>
        <strong>Scripture review</strong>
      </div>
      <Link className="workspace-back" data-cursor to="/">
        <span>Back to site</span>
        <ArrowUpIcon />
      </Link>
    </header>
  );
}
