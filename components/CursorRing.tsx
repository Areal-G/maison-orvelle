"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

/**
 * A gold ring that trails the mouse over the 3D stage and opens up with a word ("View", "Select")
 * over a piece. Mouse and trackpad only; touch screens keep their normal behaviour.
 */
export default function CursorRing({
  label,
  area,
}: {
  label: string | null;
  area: React.RefObject<HTMLElement | null>;
}) {
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [inside, setInside] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    const el = area.current;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      if (ring.current) ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const r = el?.getBoundingClientRect();
      setInside(!!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
    };
    const leave = () => setInside(false);
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [area]);

  if (!enabled) return null;
  return (
    <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-40" aria-hidden="true">
      <div
        className={clsx(
          "-translate-x-1/2 -translate-y-1/2 rounded-full border border-gold grid place-items-center transition-[width,height,opacity,background-color] duration-300 ease-out",
          label ? "size-20 bg-ivory/55 backdrop-blur-sm" : "size-7 bg-transparent",
          inside ? "opacity-100" : "opacity-0",
        )}
      >
        <span
          className={clsx(
            "text-[10px] tracking-[0.28em] uppercase text-ink transition-opacity duration-200",
            label ? "opacity-100" : "opacity-0",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
