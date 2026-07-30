import { useCallback, useEffect, useRef, useState } from "react";

type DisclosureElement = HTMLElement;

export function useHoverFocusDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimer.current === null) return;

    window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const open = useCallback(() => {
    cancelScheduledClose();
    setIsOpen(true);
  }, [cancelScheduledClose]);

  const close = useCallback(() => {
    cancelScheduledClose();
    setIsOpen(false);
  }, [cancelScheduledClose]);

  useEffect(() => cancelScheduledClose, [cancelScheduledClose]);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setIsOpen(false);
    }, 80);
  }, [cancelScheduledClose]);

  const handleBlur = useCallback(
    (event: React.FocusEvent<DisclosureElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        close();
      }
    },
    [close],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<DisclosureElement>) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      event.stopPropagation();
      close();
    },
    [close],
  );

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<DisclosureElement>) => {
      if (!event.currentTarget.contains(document.activeElement)) {
        scheduleClose();
      }
    },
    [scheduleClose],
  );

  return {
    close,
    disclosureHandlers: {
      onBlur: handleBlur,
      onFocus: open,
      onKeyDown: handleKeyDown,
      onPointerEnter: open,
      onPointerLeave: handlePointerLeave,
    },
    isOpen,
    open,
  };
}
