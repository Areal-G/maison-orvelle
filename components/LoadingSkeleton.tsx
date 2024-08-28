"use client";
import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import clsx from "clsx";
import { BrandMark } from "./BrandLogo";
import { useScenePending } from "@/lib/loading";
import { BRAND } from "@/lib/brand";

/** Full-screen loader shown while any 3D view is still loading its pieces. */
const LoadingSkeleton = () => {
  const { progress } = useProgress();
  const active = useScenePending();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    const t = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(t);
  }, [active]);

  const pct = Math.floor(progress);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={clsx(
        "fixed inset-0 z-40 grid place-items-center bg-ivory text-ink transition-opacity duration-700",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex flex-col items-center w-52 md:w-64 gap-6">
        <BrandMark className="size-14 animate-pulse text-gold" />
        <p className="font-display text-2xl tracking-[0.34em]">{BRAND.wordmark}</p>
        <div className="w-full">
          <div className="h-px w-full bg-ink/10 overflow-hidden">
            <div className="h-full bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 eyebrow text-center tabular-nums">
            {visible ? `Preparing the atelier · ${pct}%` : "Ready"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
