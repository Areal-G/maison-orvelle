import { describe, expect, it } from "vitest";
import { addLine, lineId, lineLabel, setLineQty, shippingFor, subtotalOf, type CartLine } from "@/lib/cartLines";

describe("addLine", () => {
  it("merges the same piece, size and colour into one line", () => {
    const once = addLine([], "rouge-wrap-top", "M", { colour: "emerald" });
    const twice = addLine(once, "rouge-wrap-top", "M", { colour: "emerald", qty: 2 });
    expect(twice).toEqual([{ slug: "rouge-wrap-top", size: "M", qty: 3, colour: "emerald" }]);
  });

  it("stores the default colourway as no colour so it merges with older lines", () => {
    const lines = addLine([{ slug: "rouge-wrap-top", size: "S", qty: 1 }], "rouge-wrap-top", "S", {
      colour: "crimson",
    });
    expect(lines).toEqual([{ slug: "rouge-wrap-top", size: "S", qty: 2 }]);
  });

  it("keeps different sizes on separate lines and caps quantity at 9", () => {
    let lines = addLine([], "azure-silk-blouse", "XS", { qty: 8 });
    lines = addLine(lines, "azure-silk-blouse", "XS", { qty: 5 });
    lines = addLine(lines, "azure-silk-blouse", "L");
    expect(lines.map((l) => [l.size, l.qty])).toEqual([
      ["XS", 9],
      ["L", 1],
    ]);
  });
});

describe("setLineQty", () => {
  const lines: CartLine[] = [
    { slug: "rouge-wrap-top", size: "M", qty: 2 },
    { slug: "azure-silk-blouse", size: "S", qty: 1 },
  ];

  it("updates only the targeted line", () => {
    expect(setLineQty(lines, lineId(lines[0]), 4)[0].qty).toBe(4);
    expect(setLineQty(lines, lineId(lines[0]), 4)[1]).toBe(lines[1]);
  });

  it("removes a line when its quantity reaches zero", () => {
    expect(setLineQty(lines, lineId(lines[1]), 0)).toEqual([lines[0]]);
  });
});

describe("totals", () => {
  it("prices the bag and ignores unknown pieces", () => {
    const lines: CartLine[] = [
      { slug: "rouge-wrap-top", size: "M", qty: 2 },
      { slug: "retired-piece", size: "M", qty: 1 },
    ];
    expect(subtotalOf(lines)).toBe(1560);
  });

  it("charges flat shipping below the free-shipping threshold only", () => {
    expect(shippingFor(0)).toBe(0);
    expect(shippingFor(499)).toBe(25);
    expect(shippingFor(500)).toBe(0);
  });

  it("labels a line with its colour and size", () => {
    expect(lineLabel({ slug: "rouge-wrap-top", size: "M", qty: 1, colour: "emerald" })).toBe("Emerald · Size M");
    expect(lineLabel({ slug: "rouge-wrap-top", size: "M", qty: 1 })).toBe("Crimson · Size M");
  });
});
