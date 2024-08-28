"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "@react-three/drei";
import clsx from "clsx";
import AtelierScene from "@/components/three/AtelierScene";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import CursorRing from "@/components/CursorRing";
import { useMedia } from "@/lib/useMedia";
import { COLLECTIONS, formatPrice, productsIn, type CollectionId } from "@/lib/products";

/** How long each piece stays in front before the ring turns on by itself. */
const AUTOPLAY_MS = 5500;
/** After a click, tap or swipe, wait a little longer before carrying on. */
const RESUME_MS = 9000;

export default function Home() {
  const router = useRouter();
  const isMobile = useMedia("(max-width: 767px)");
  // The house signature piece opens the atelier: Soirée, Tweed Belted Jacket first.
  const [collection, setCollection] = useState<CollectionId>("soiree");
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [delay, setDelay] = useState(AUTOPLAY_MS);
  const [round, setRound] = useState(0);
  const stage = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const products = useMemo(() => productsIn(collection), [collection]);
  const meta = COLLECTIONS.find((c) => c.id === collection)!;
  const current = products[active];
  const paused = hovered !== null || leaving || hidden;

  // Autoplay: the ring turns on by itself; after the last piece it moves on to the next collection.
  // Pauses while a piece is hovered, while leaving, or while the tab is hidden.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      if (active < products.length - 1) setActive(active + 1);
      else {
        const at = COLLECTIONS.findIndex((c) => c.id === collection);
        setCollection(COLLECTIONS[(at + 1) % COLLECTIONS.length].id);
        setActive(0);
      }
      setDelay(AUTOPLAY_MS);
      setRound((r) => r + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [active, collection, products.length, paused, delay, round]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  /** Any manual choice restarts the clock with a longer pause. */
  const choose = (i: number) => {
    setActive(i);
    setDelay(RESUME_MS);
    setRound((r) => r + 1);
  };
  const step = (d: number) => choose((active + d + products.length) % products.length);
  const switchTo = (id: CollectionId) => {
    setCollection(id);
    choose(0);
  };

  // Swipe left/right on touch screens.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.changedTouches[0].clientX - t.x;
    const dy = e.changedTouches[0].clientY - t.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  };

  /** Glide the camera up to the piece, let the veil fall, then open its page. */
  const open = (slug: string) => {
    if (leaving) return;
    const href = `/product/${slug}`;
    router.prefetch(href);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    setActive(products.findIndex((p) => p.slug === slug));
    setLeaving(true);
    timer.current = setTimeout(() => router.push(href), 780);
  };

  const cursorLabel = hovered === null ? null : hovered === active ? "View" : "Select";

  return (
    <>
      <main ref={stage} className="relative h-svh overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <h1 className="sr-only">Maison Orvelle — women&apos;s tops in 3D. {meta.title} collection.</h1>
        <View className="absolute inset-0">
          <AtelierScene
            products={products}
            active={active}
            hovered={hovered}
            onSelect={choose}
            onOpen={open}
            onHover={setHovered}
            isMobile={isMobile}
            leaving={leaving}
          />
        </View>

        {/* collection intro */}
        <section
          aria-label="Collections"
          className="absolute z-20 md:left-14 left-4 md:top-36 top-[4.5rem] max-w-sm pointer-events-none"
        >
          <p className="eyebrow">Collection · {meta.season}</p>
          <h2 className="font-display italic text-[3.4rem] md:text-8xl leading-[0.9] mt-2 md:mt-3 text-ink">
            <Reveal text={meta.title} step={45} />
          </h2>
          <p key={meta.id} className="note-in text-sm text-muted mt-4 max-w-[17rem] hidden sm:block">
            {meta.note}
          </p>
          <div className="flex gap-2 mt-4 md:mt-6 pointer-events-auto" role="tablist" aria-label="Choose a collection">
            {COLLECTIONS.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={c.id === collection}
                onClick={() => switchTo(c.id)}
                className={clsx(
                  "px-4 py-2 text-[10px] tracking-[0.28em] uppercase border transition-colors duration-300",
                  c.id === collection
                    ? "bg-ink text-ivory border-ink"
                    : "border-ink/25 text-ink bg-ivory/40 hover:border-ink",
                )}
              >
                {c.title}
              </button>
            ))}
          </div>
        </section>

        {/* current piece + controls */}
        <section
          aria-label="Pieces in this collection"
          className="absolute z-20 md:right-14 right-4 left-4 md:left-auto md:bottom-16 bottom-6 flex flex-col md:items-end items-center gap-3 md:gap-4"
        >
          {current && (
            <div className="text-center md:text-right" aria-live="polite">
              <p className="eyebrow">
                {String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
              </p>
              <p className="font-display text-[1.75rem] md:text-4xl mt-1 leading-tight">
                <Reveal text={current.name} />
              </p>
              <p key={current.slug} className="note-in text-xs text-muted mt-1">
                {current.material} · {formatPrice(current.price)}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous piece"
              onClick={() => step(-1)}
              className="size-11 grid place-items-center border border-ink/25 bg-ivory/50 backdrop-blur-sm hover:bg-ink hover:text-ivory transition-colors"
            >
              ←
            </button>
            {current && (
              <Link
                href={`/product/${current.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  open(current.slug);
                }}
                className="btn-primary"
              >
                View piece
              </Link>
            )}
            <button
              type="button"
              aria-label="Next piece"
              onClick={() => step(1)}
              className="size-11 grid place-items-center border border-ink/25 bg-ivory/50 backdrop-blur-sm hover:bg-ink hover:text-ivory transition-colors"
            >
              →
            </button>
          </div>
          {/* the active dash fills while the piece waits its turn */}
          <ul className="flex gap-1.5" aria-label="Jump to a piece">
            {products.map((p, i) => (
              <li key={p.slug}>
                <button
                  type="button"
                  aria-label={p.name}
                  aria-current={i === active}
                  onClick={() => choose(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative block h-0.5 w-10 bg-ink/20 hover:bg-ink/40 transition-colors overflow-hidden"
                >
                  {i === active && (
                    <span
                      key={round}
                      className="autoplay-fill absolute inset-0 bg-ink origin-left"
                      style={{ animationDuration: `${delay}ms`, animationPlayState: paused ? "paused" : "running" }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/shop"
          className="absolute z-20 md:right-14 right-4 md:top-36 top-20 eyebrow text-ink hover:text-gold transition-colors hidden sm:block"
        >
          Shop all →
        </Link>
        <p className="absolute z-10 md:left-14 md:bottom-16 eyebrow pointer-events-none max-md:hidden">
          Click a piece · click again to open
        </p>
        <div className="leave-veil" data-on={leaving} aria-hidden="true" />
      </main>
      <CursorRing label={cursorLabel} area={stage} />
      <div className="relative z-10 bg-ivory">
        <Footer />
      </div>
    </>
  );
}
