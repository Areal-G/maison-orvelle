"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { filterProducts, PRICES, type PriceId, type Sort } from "@/lib/catalog";
import {
  COLLECTIONS,
  COLOUR_FAMILIES,
  FABRICS,
  PRODUCTS,
  type CollectionId,
  type ColourFamily,
  type Fabric,
} from "@/lib/products";

// Only offer filters that match at least one piece.
const FABRIC_OPTIONS = (Object.keys(FABRICS) as Fabric[]).filter((f) => PRODUCTS.some((p) => p.fabric === f));
const FAMILY_OPTIONS = (Object.keys(COLOUR_FAMILIES) as ColourFamily[]).filter((f) =>
  PRODUCTS.some((p) => p.colours.some((c) => c.family === f)),
);

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

const chip = (on: boolean) =>
  clsx(
    "border px-3.5 py-2 text-[10px] tracking-[0.24em] uppercase transition-colors flex items-center gap-2",
    on ? "bg-ink text-ivory border-ink" : "border-ink/20 hover:border-ink",
  );

export default function ShopPage() {
  const { add } = useCart();
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<CollectionId | "all">("all");
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [families, setFamilies] = useState<ColourFamily[]>([]);
  const [price, setPrice] = useState<PriceId | null>(null);
  const [sort, setSort] = useState<Sort>("featured");
  const [panel, setPanel] = useState(false);

  const active = fabrics.length + families.length + (price ? 1 : 0);
  const reset = () => {
    setQuery("");
    setFabrics([]);
    setFamilies([]);
    setPrice(null);
    setCollection("all");
  };

  const list = useMemo(
    () => filterProducts(PRODUCTS, { query, collection, fabrics, families, price, sort }),
    [query, collection, fabrics, families, price, sort],
  );

  return (
    <main className="relative z-10 min-h-screen">
      <section className="px-4 md:px-14 pt-32 md:pt-40 pb-10">
        <p className="eyebrow">The boutique</p>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.9] mt-3">
          All <em>pieces</em>
        </h1>
        <p className="max-w-md text-sm text-muted mt-5">
          Every top in the house, in every collection. Each one turns live in 3D: hover a piece to bring it closer.
        </p>

        <div className="mt-10 border-y border-ink/10 py-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex-1 min-w-[220px] max-w-md">
              <span className="sr-only">Search pieces</span>
              <svg
                viewBox="0 0 24 24"
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search silk, corset, emerald…"
                className="w-full bg-transparent border border-ink/20 focus:border-ink pl-9 pr-3 py-2.5 text-sm placeholder:text-muted/80 outline-none transition-colors"
              />
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by collection">
              {(["all", ...COLLECTIONS.map((c) => c.id)] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={collection === c}
                  onClick={() => setCollection(c)}
                  className={chip(collection === c)}
                >
                  {c === "all" ? "All" : COLLECTIONS.find((x) => x.id === c)!.title}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                aria-expanded={panel}
                aria-controls="shop-filters"
                onClick={() => setPanel((v) => !v)}
                className={chip(panel)}
              >
                Filters{active > 0 && <span className="tabular-nums">({active})</span>}
                <span className={clsx("transition-transform", panel && "rotate-45")} aria-hidden="true">
                  +
                </span>
              </button>
              <label className="flex items-center gap-3 eyebrow">
                <span className="max-sm:sr-only">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="bg-transparent border border-ink/20 px-3 py-2 text-ink normal-case tracking-normal text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </label>
            </div>
          </div>

          <div id="shop-filters" hidden={!panel} className="grid gap-6 md:grid-cols-3 pt-2 note-in">
            <fieldset>
              <legend className="eyebrow mb-3">Fabric</legend>
              <div className="flex flex-wrap gap-2">
                {FABRIC_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={fabrics.includes(f)}
                    onClick={() => setFabrics((l) => toggle(l, f))}
                    className={chip(fabrics.includes(f))}
                  >
                    {FABRICS[f]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow mb-3">Colour</legend>
              <div className="flex flex-wrap gap-2">
                {FAMILY_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={families.includes(f)}
                    onClick={() => setFamilies((l) => toggle(l, f))}
                    className={chip(families.includes(f))}
                  >
                    <span
                      className="size-2.5 rounded-full ring-1 ring-ink/20"
                      style={{ background: COLOUR_FAMILIES[f].hex }}
                      aria-hidden="true"
                    />
                    {COLOUR_FAMILIES[f].label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow mb-3">Price</legend>
              <div className="flex flex-wrap gap-2">
                {PRICES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={price === p.id}
                    onClick={() => setPrice(price === p.id ? null : p.id)}
                    className={chip(price === p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </section>

      <section aria-label="Products" className="px-4 md:px-14 pb-24">
        <p className="eyebrow mb-6" aria-live="polite">
          {list.length} {list.length === 1 ? "piece" : "pieces"}
          {(active > 0 || query || collection !== "all") && (
            <button
              type="button"
              onClick={reset}
              className="ml-4 text-ink underline underline-offset-4 decoration-gold hover:text-gold"
            >
              Clear all
            </button>
          )}
        </p>
        {list.length ? (
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} onQuickAdd={() => add(p.slug, "M")} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-t border-ink/10 pt-10 max-w-md">
            <p className="font-display text-3xl">Nothing on the rail for that.</p>
            <p className="text-sm text-muted mt-2">Try another fabric or colour, or clear the filters.</p>
            <button type="button" onClick={reset} className="btn-ghost mt-6">
              Clear filters
            </button>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
