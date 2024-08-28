import { FABRICS, type CollectionId, type ColourFamily, type Fabric, type Product } from "./products";

export type Sort = "featured" | "low" | "high";

export const PRICES = [
  { id: "under-1000", label: "Under $1,000", test: (n: number) => n < 1000 },
  { id: "1000-1500", label: "$1,000 – $1,500", test: (n: number) => n >= 1000 && n <= 1500 },
  { id: "over-1500", label: "Over $1,500", test: (n: number) => n > 1500 },
] as const;
export type PriceId = (typeof PRICES)[number]["id"];

export type CatalogFilters = {
  query: string;
  collection: CollectionId | "all";
  fabrics: Fabric[];
  families: ColourFamily[];
  price: PriceId | null;
  sort: Sort;
};

/** Lower-case and strip accents so "soiree" matches "Soirée". */
export const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const searchText = (p: Product) =>
  fold([p.name, p.material, p.blurb, FABRICS[p.fabric], ...p.colours.map((c) => c.name), ...p.details].join(" "));

/** Applies the shop's search, filters and sort. Every search word must match somewhere. */
export function filterProducts(products: readonly Product[], filters: CatalogFilters): Product[] {
  const { query, collection, fabrics, families, price, sort } = filters;
  const words = fold(query).split(/\s+/).filter(Boolean);
  const priceTest = PRICES.find((p) => p.id === price)?.test;

  const filtered = products.filter((p) => {
    if (collection !== "all" && p.collection !== collection) return false;
    if (fabrics.length && !fabrics.includes(p.fabric)) return false;
    if (families.length && !p.colours.some((c) => families.includes(c.family))) return false;
    if (priceTest && !priceTest(p.price)) return false;
    if (words.length) {
      const hay = searchText(p);
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });

  if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
  return filtered;
}
