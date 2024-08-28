"use client";
import { useRef, useState } from "react";
import clsx from "clsx";
import { SIZES, type Size } from "@/lib/products";

/** Body measurements in centimetres. */
const CHART: Record<Size, { bust: number; waist: number; hip: number }> = {
  XS: { bust: 80, waist: 62, hip: 88 },
  S: { bust: 84, waist: 66, hip: 92 },
  M: { bust: 88, waist: 70, hip: 96 },
  L: { bust: 94, waist: 76, hip: 102 },
  XL: { bust: 100, waist: 82, hip: 108 },
};
const COLS = ["bust", "waist", "hip"] as const;

/** "Size guide" link that opens a modal measurement chart. Corsetry highlights the waist column. */
export default function SizeGuide({ fit, selected }: { fit?: "waist"; selected?: Size | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const key = fit === "waist" ? "waist" : "bust";
  const fmt = (cm: number) => (unit === "cm" ? String(cm) : (cm / 2.54).toFixed(1));

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] underline underline-offset-4 decoration-ink/30 hover:decoration-gold transition-colors"
      >
        Size guide
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="size-guide-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="size-guide m-auto w-[min(560px,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] bg-ivory text-ink p-0 backdrop:bg-ink/35 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 md:p-9">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow">Maison Orvelle</p>
              <h2 id="size-guide-title" className="font-display text-4xl mt-2">
                Size guide
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="hover-animation text-xs tracking-[0.2em] uppercase py-2"
              autoFocus
            >
              Close
            </button>
          </div>

          <p className="text-sm text-muted mt-4 leading-relaxed">
            {fit === "waist"
              ? "Corsetry is fitted to the natural waist. Choose by your waist measurement; the lacing adjusts by about one size."
              : "Our tops are cut to the bust. Between sizes? Take the larger for a softer fit, the smaller for a close one."}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <p className="eyebrow">Body measurements</p>
            <div className="flex border border-ink/20" role="group" aria-label="Units">
              {(["cm", "in"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  aria-pressed={unit === u}
                  onClick={() => setUnit(u)}
                  className={clsx(
                    "px-3 py-1 text-[11px] tracking-[0.2em] uppercase transition-colors",
                    unit === u ? "bg-ink text-ivory" : "hover:bg-stone",
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full mt-3 text-sm tabular-nums">
            <caption className="sr-only">Body measurements in {unit === "cm" ? "centimetres" : "inches"}</caption>
            <thead>
              <tr className="border-b border-ink/15 text-left">
                <th scope="col" className="py-2.5 font-medium eyebrow">
                  Size
                </th>
                {COLS.map((c) => (
                  <th key={c} scope="col" className={clsx("py-2.5 font-medium eyebrow", c === key && "text-ink")}>
                    {c}
                    {c === key && <span className="text-gold"> ●</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s} className={clsx("border-b border-ink/10", selected === s && "bg-stone/70")}>
                  <th scope="row" className="py-2.5 pl-1 text-left font-medium">
                    {s}
                  </th>
                  {COLS.map((c) => (
                    <td key={c} className={clsx("py-2.5", c === key ? "text-ink font-medium" : "text-muted")}>
                      {fmt(CHART[s][c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <details className="mt-6 group">
            <summary className="eyebrow cursor-pointer list-none flex justify-between">
              How to measure <span className="group-open:rotate-45 transition-transform">+</span>
            </summary>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="inline font-medium">Bust · </dt>
                <dd className="inline text-muted">around the fullest part, tape level under the arms.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Waist · </dt>
                <dd className="inline text-muted">around the narrowest part, usually just above the navel.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Hip · </dt>
                <dd className="inline text-muted">around the fullest part, feet together.</dd>
              </div>
            </dl>
          </details>
        </div>
      </dialog>
    </>
  );
}
