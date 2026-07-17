import { useEffect, useState } from "react";

const hiddenCursor = { x: -100, y: -100, active: false };

export function CustomCursor() {
  const [cursor, setCursor] = useState(hiddenCursor);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursor((current) => ({ ...current, x: event.clientX, y: event.clientY }));
    };
    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      setCursor((current) => ({
        ...current,
        active: Boolean(target.closest("[data-cursor]")),
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div
      className={`custom-cursor ${cursor.active ? "is-active" : ""}`}
      style={{ left: cursor.x, top: cursor.y }}
    />
  );
}
