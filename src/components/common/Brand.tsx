import { Link } from "react-router-dom";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link className={`brand ${light ? "light-brand" : ""}`} data-cursor to="/">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <i />
      </span>
      <span>Sermon Prep</span>
    </Link>
  );
}
