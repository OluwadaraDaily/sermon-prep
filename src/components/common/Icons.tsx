import type { ReactNode } from "react";

export type IconName =
  "book" | "bookmark" | "compass" | "export" | "pen" | "search" | "arrow-up";

export function Icon({ name }: { name: IconName }) {
  const icons = {
    book: <BookIcon />,
    bookmark: <BookmarkIcon />,
    compass: <CompassIcon />,
    export: <ExportIcon />,
    pen: <PenIcon />,
    search: <SearchIcon />,
    "arrow-up": <ArrowUpIcon />,
  } satisfies Record<IconName, ReactNode>;

  return icons[name];
}

export function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18">
      <path d="M3 9h11M9.5 4.5 14 9l-4.5 4.5" />
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18">
      <path d="m5 13 8-8M6 5h7v7" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18">
      <path d="m3.5 9 3.5 3.5 7.5-7" />
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4.5 5.5c2.8-1.3 5.3-.9 7.5.8v12.2c-2.2-1.7-4.7-2.1-7.5-.8V5.5Zm15 0c-2.8-1.3-5.3-.9-7.5.8v12.2c2.2-1.7 4.7-2.1 7.5-.8V5.5Z" />
    </svg>
  );
}

export function BookmarkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.5 4.5h11v16l-5.5-3.4-5.5 3.4v-16Z" />
    </svg>
  );
}

export function ExportIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 4v11m0-11 4 4m-4-4L8 8M5 12v6.5h14V12" />
    </svg>
  );
}

export function CompassIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
    </svg>
  );
}

export function PenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 16.5-.8 3.3 3.3-.8L19 7.5 16.5 5 5 16.5Zm10.8-10.8 2.5 2.5M5 20h14" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 3 1.5 7.5L21 12l-7.5 1.5L12 21l-1.5-7.5L3 12l7.5-1.5L12 3Z" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="5.5" y="10" width="13" height="10" rx="1.5" />
      <path d="M8 10V7.8a4 4 0 0 1 8 0V10" />
    </svg>
  );
}
