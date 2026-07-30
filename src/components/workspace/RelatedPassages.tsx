import { useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";

import type { RelatedPassage } from "../../core/bible/types";
import type { RelatedPassagePreview } from "../../features/workspace/useWorkspace";
import { useHoverFocusDisclosure } from "../../features/workspace/useHoverFocusDisclosure";
import { relatedPassageKey } from "../../features/workspace/workspaceUtils";
import { PassagePreview } from "./PassagePreview";

interface RelatedPassagesProps {
  onPassageHover: (passage: RelatedPassage) => void;
  passages: RelatedPassage[];
  previews: Record<string, RelatedPassagePreview>;
  referenceId: string;
}

export function RelatedPassages({
  onPassageHover,
  passages,
  previews,
  referenceId,
}: RelatedPassagesProps) {
  return (
    <section className="related-passages" aria-labelledby={`related-${referenceId}`}>
      <h3 id={`related-${referenceId}`}>Related passages</h3>
      <ul>
        {passages.map((passage) => (
          <RelatedPassageItem
            key={passage.normalized}
            onPassageHover={onPassageHover}
            passage={passage}
            preview={previews[relatedPassageKey(passage)]}
          />
        ))}
      </ul>
      <p>Ranked from the OpenBible cross-reference data.</p>
    </section>
  );
}

function RelatedPassageItem({
  onPassageHover,
  passage,
  preview,
}: {
  onPassageHover: (passage: RelatedPassage) => void;
  passage: RelatedPassage;
  preview?: RelatedPassagePreview;
}) {
  const { disclosureHandlers, isOpen } = useHoverFocusDisclosure();
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);

  function handleActivate() {
    onPassageHover(passage);
  }

  useLayoutEffect(() => {
    if (!isOpen) {
      setTooltipPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      setTooltipPosition(calculateTooltipPosition(triggerRef.current, tooltipRef.current));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, preview?.status]);

  const tooltipStyle = tooltipPosition
    ? ({
        left: `${tooltipPosition.left}px`,
        top: `${tooltipPosition.top}px`,
        "--tooltip-tail-offset": `${tooltipPosition.tailOffset}px`,
      } as CSSProperties)
    : undefined;

  const tooltip = isOpen ? (
    <div
      ref={tooltipRef}
      className="related-passage-tooltip"
      data-placement={tooltipPosition?.placement}
      id={tooltipId}
      role="tooltip"
      style={{
        ...tooltipStyle,
        visibility: tooltipPosition ? "visible" : "hidden",
      }}
      {...disclosureHandlers}
    >
      <strong>{passage.normalized}</strong>
      {!preview || preview.status === "loading" ? (
        <p>Loading passage…</p>
      ) : preview.status === "error" ? (
        <p>Could not load this passage.</p>
      ) : preview.status === "loaded" ? (
        <PassagePreview passage={preview.passage} />
      ) : null}
      <small>
        {preview?.status === "loaded"
          ? preview.passage.versionName
          : "World English Bible"}
      </small>
    </div>
  ) : null;

  return (
    <>
      <li className="related-passage-item" {...disclosureHandlers}>
        <button
          ref={triggerRef}
          aria-describedby={isOpen ? tooltipId : undefined}
          aria-label={`Preview ${passage.normalized}`}
          className="related-passage-trigger"
          data-preview-state={preview?.status ?? "idle"}
          data-preview-open={isOpen}
          type="button"
          onFocus={handleActivate}
          onMouseEnter={handleActivate}
        >
          {passage.normalized}
        </button>
      </li>
      {tooltip ? createPortal(tooltip, document.body) : null}
    </>
  );
}

type TooltipPlacement = "bottom" | "left" | "right" | "top";

type TooltipPosition = {
  left: number;
  placement: TooltipPlacement;
  tailOffset: number;
  top: number;
};

function calculateTooltipPosition(
  trigger: HTMLButtonElement,
  tooltip: HTMLDivElement,
): TooltipPosition {
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;
  const viewportPadding = 16;
  const gap = 10;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const availableSpaces = {
    bottom: viewportHeight - triggerRect.bottom,
    left: triggerRect.left,
    right: viewportWidth - triggerRect.right,
    top: triggerRect.top,
  };

  const placement =
    availableSpaces.top >= tooltipHeight + gap + viewportPadding
      ? "top"
      : availableSpaces.right >= tooltipWidth + gap + viewportPadding
        ? "right"
        : availableSpaces.left >= tooltipWidth + gap + viewportPadding
          ? "left"
          : availableSpaces.bottom >= tooltipHeight + gap + viewportPadding
            ? "bottom"
            : largestAvailableSpace(availableSpaces);

  const centerX = triggerRect.left + triggerRect.width / 2;
  const centerY = triggerRect.top + triggerRect.height / 2;
  const left =
    placement === "right"
      ? triggerRect.right + gap
      : placement === "left"
        ? triggerRect.left - tooltipWidth - gap
        : clamp(
            centerX - tooltipWidth / 2,
            viewportPadding,
            viewportWidth - tooltipWidth - viewportPadding,
          );
  const top =
    placement === "top"
      ? triggerRect.top - tooltipHeight - gap
      : placement === "bottom"
        ? triggerRect.bottom + gap
        : clamp(
            centerY - tooltipHeight / 2,
            viewportPadding,
            viewportHeight - tooltipHeight - viewportPadding,
          );
  const tailOffset =
    placement === "left" || placement === "right"
      ? clamp(centerY - top, 18, tooltipHeight - 18)
      : clamp(centerX - left, 18, tooltipWidth - 18);

  return {
    left: Math.round(left),
    placement,
    tailOffset: Math.round(tailOffset),
    top: Math.round(top),
  };
}

function largestAvailableSpace(spaces: Record<TooltipPlacement, number>): TooltipPlacement {
  return (Object.entries(spaces) as [TooltipPlacement, number][]).sort(
    ([, leftSpace], [, rightSpace]) => rightSpace - leftSpace,
  )[0][0];
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
