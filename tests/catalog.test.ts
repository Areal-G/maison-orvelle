import { describe, expect, it } from "vitest";
import { filterProducts, fold, type CatalogFilters } from "@/lib/catalog";
import { PRODUCTS } from "@/lib/products";

const all: CatalogFilters = { query: "", collection: "all", fabrics: [], families: [], price: null, sort: "featured" };
const slugs = (filters: Partial<CatalogFilters>) => filterProducts(PRODUCTS, { ...all, ...filters }).map((p) => p.slug);

describe("filterProducts", () => {
  it("returns every piece in catalogue order by default", () => {
    expect(slugs({})).toEqual(PRODUCTS.map((p) => p.slug));
  });

  it("combines collection, fabric and price filters", () => {
    expect(slugs({ collection: "riviera", fabrics: ["silk"] })).toEqual(["fuchsia-puff-top", "azure-silk-blouse"]);
    expect(slugs({ fabrics: ["leather"], price: "over-1500" })).toEqual([]);
  });

  it("matches a colour family when any colourway is in it", () => {
    expect(slugs({ families: ["green"] })).toContain("rouge-wrap-top");
  });

  it("requires every search word and ignores accents and case", () => {
    expect(slugs({ query: "SILK wrap" })).toEqual(["rouge-wrap-top"]);
    expect(slugs({ query: "silk zebra" })).toEqual([]);
  });

  it("sorts by price in both directions without mutating the input", () => {
    const before = PRODUCTS.map((p) => p.slug);
    const low = filterProducts(PRODUCTS, { ...all, sort: "low" }).map((p) => p.price);
    const high = filterProducts(PRODUCTS, { ...all, sort: "high" }).map((p) => p.price);
    expect(low).toEqual([...low].sort((a, b) => a - b));
    expect(high).toEqual([...low].reverse());
    expect(PRODUCTS.map((p) => p.slug)).toEqual(before);
  });
});

describe("fold", () => {
  it("strips accents", () => {
    expect(fold("Soirée")).toBe("soiree");
  });
});
