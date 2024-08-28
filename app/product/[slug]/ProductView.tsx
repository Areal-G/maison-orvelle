"use client";
import Link from "next/link";
import { useState } from "react";
import { View } from "@react-three/drei";
import clsx from "clsx";
import ProductStage from "@/components/three/ProductStage";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import SizeGuide from "@/components/SizeGuide";
import SaveButton from "@/components/SaveButton";
import { useCart } from "@/lib/cart";
import { useMedia } from "@/lib/useMedia";
import { COLLECTIONS, PRODUCTS, SIZES, formatPrice, getProduct, type Size } from "@/lib/products";

export default function ProductView({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const isMobile = useMedia("(max-width: 1023px)");
  const { add } = useCart();
  const [size, setSize] = useState<Size | null>(null);
  const [nudge, setNudge] = useState(false);
  const [colourId, setColourId] = useState(product.colours[0].id);
  const [note, setNote] = useState<number | null>(null);
  const colour = product.colours.find((c) => c.id === colourId) ?? product.colours[0];
  const isOriginal = colour.id === product.colours[0].id;
  const fabricLine = product.material.split(" · ")[0];
  const collection = COLLECTIONS.find((c) => c.id === product.collection)!;
  const related = PRODUCTS.filter((p) => p.collection === product.collection && p.slug !== product.slug).slice(0, 3);

  const addToBag = () => {
    if (!size) {
      setNudge(true);
      return;
    }
    add(product.slug, size, { colour: colour.id });
  };

  return (
    <main>
      <section className="relative lg:h-screen" aria-label={`${product.name} in 3D`}>
        {/* phones: the piece gets its own band and the buy panel sits below it; desktop: panel floats beside it */}
        <div className="relative h-[72svh] lg:absolute lg:inset-0 lg:h-auto">
          <View className="absolute inset-0">
            <ProductStage
              product={product}
              isMobile={isMobile}
              colour={isOriginal ? null : colour.hex}
              activeNote={note}
              onNote={setNote}
            />
          </View>

          {/* fabric notes: the gold dots on the piece; these buttons do the same for keyboard and touch */}
          <div className="absolute z-10 lg:left-14 lg:bottom-10 lg:w-[340px] max-lg:left-3 max-lg:right-3 max-lg:bottom-4 flex flex-col gap-3 pointer-events-none">
            <div aria-live="polite">
              {note !== null && (
                <div key={note} className="panel p-5 pointer-events-auto note-in">
                  <div className="flex items-start justify-between gap-4">
                    <p className="eyebrow text-gold">Fabric note · {String(note + 1).padStart(2, "0")}</p>
                    <button
                      type="button"
                      onClick={() => setNote(null)}
                      className="hover-animation text-[10px] tracking-[0.2em] uppercase -mt-1 py-1"
                      aria-label="Close note"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-display text-2xl mt-1.5">{product.hotspots[note].title}</p>
                  <p className="text-sm text-muted mt-1 leading-relaxed">{product.hotspots[note].note}</p>
                </div>
              )}
            </div>
            <div className="pointer-events-auto">
              {/* Frosted like the note chips so it stays legible where it crosses the piece. */}
              <p className="eyebrow mb-2 inline-block bg-ivory/70 px-2 py-1 backdrop-blur-md max-lg:hidden">
                Drag to turn · tap a gold dot
              </p>
              <ul
                className="flex lg:flex-wrap gap-1.5 max-lg:overflow-x-auto max-lg:-mx-3 max-lg:px-3 [scrollbar-width:none]"
                aria-label="Fabric notes"
              >
                {product.hotspots.map((h, i) => (
                  <li key={h.title}>
                    <button
                      type="button"
                      aria-pressed={note === i}
                      onClick={() => setNote(note === i ? null : i)}
                      className={clsx(
                        "flex items-center gap-2 whitespace-nowrap border px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase backdrop-blur-md transition-colors",
                        note === i ? "bg-ink text-ivory border-ink" : "bg-ivory/70 border-ink/15 hover:border-ink",
                      )}
                    >
                      <span
                        className={clsx("size-1.5 rounded-full", note === i ? "bg-gold" : "bg-gold/80")}
                        aria-hidden="true"
                      />
                      {h.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside
          aria-label="Purchase"
          className="relative lg:absolute z-20 panel lg:right-14 lg:top-28 lg:bottom-auto lg:w-[400px] max-lg:mx-3 p-6 lg:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="eyebrow">
              <Link href="/shop" className="hover:text-ink">
                Shop
              </Link>{" "}
              · {collection.title}
            </nav>
            <SaveButton slug={product.slug} name={product.name} className="text-ink hover:text-gold -my-2 py-2" label />
          </div>
          <div className="flex items-start justify-between gap-4 mt-3">
            <h1 className="font-display text-3xl lg:text-5xl leading-[0.95]">{product.name}</h1>
            <p className="font-display text-2xl lg:text-3xl tabular-nums">{formatPrice(product.price)}</p>
          </div>
          <p className="text-xs text-muted mt-2">
            {fabricLine} · {colour.name}
          </p>
          <p className="text-sm leading-relaxed mt-5 max-lg:hidden">{product.blurb}</p>

          <fieldset className="mt-5 lg:mt-6">
            <legend className="eyebrow mb-3">
              Colour · <span className="text-ink">{colour.name}</span>
            </legend>
            <div className="flex gap-2.5">
              {product.colours.map((c) => (
                <label key={c.id} className="relative" title={c.name}>
                  <input
                    type="radio"
                    name="colour"
                    value={c.id}
                    checked={colour.id === c.id}
                    onChange={() => setColourId(c.id)}
                    className="peer sr-only"
                    aria-label={c.name}
                  />
                  <span
                    className="block size-8 rounded-full cursor-pointer ring-1 ring-ink/15 ring-offset-2 ring-offset-ivory transition-shadow peer-checked:ring-ink peer-checked:ring-[1.5px] peer-focus-visible:outline peer-focus-visible:outline-gold hover:ring-ink/50"
                    style={{
                      background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.45), transparent 55%), ${c.hex}`,
                    }}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="relative mt-5 lg:mt-6">
            <div className="absolute right-0 top-0 -mt-px z-10">
              <SizeGuide fit={product.fit} selected={size} />
            </div>
            <fieldset>
              <legend className={clsx("eyebrow mb-3", nudge && !size && "text-[#a2402c]")}>
                {nudge && !size ? "Choose a size first" : "Size"}
              </legend>
              <div className="grid grid-cols-5 gap-1.5">
                {SIZES.map((s) => (
                  <label key={s} className="relative">
                    <input
                      type="radio"
                      name="size"
                      value={s}
                      checked={size === s}
                      onChange={() => setSize(s)}
                      className="peer sr-only"
                    />
                    <span className="grid place-items-center h-10 border border-ink/20 text-xs tracking-[0.1em] cursor-pointer transition-colors peer-checked:bg-ink peer-checked:text-ivory peer-checked:border-ink hover:border-ink peer-focus-visible:outline peer-focus-visible:outline-gold">
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <button type="button" onClick={addToBag} className="btn-primary w-full mt-5">
            Add to bag · {formatPrice(product.price)}
          </button>
          <details className="mt-5 group max-lg:hidden" open>
            <summary className="eyebrow cursor-pointer list-none flex justify-between">
              Details <span className="group-open:rotate-45 transition-transform">+</span>
            </summary>
            <ul className="mt-3 space-y-1.5 text-sm">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-gold">—</span>
                  {d}
                </li>
              ))}
            </ul>
          </details>
          <p className="eyebrow mt-5 max-lg:hidden">Complimentary shipping over $500</p>
        </aside>
      </section>

      <section className="relative z-10 px-4 md:px-14 pt-12 pb-4 md:pt-16 lg:hidden" aria-label="Details">
        <p className="text-base leading-relaxed">{product.blurb}</p>
        <ul className="mt-6 space-y-1.5 text-sm">
          {product.details.map((d) => (
            <li key={d} className="flex gap-2">
              <span className="text-gold">—</span>
              {d}
            </li>
          ))}
        </ul>
      </section>

      <section className="relative z-10 px-4 md:px-14 py-16 md:py-24" aria-labelledby="related">
        <p className="eyebrow">{collection.title} collection</p>
        <h2 id="related" className="font-display text-4xl md:text-5xl mt-2">
          Complete the look
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
