import { getColour, getProduct, type Size } from "./products";

/** colour is the colourway id; missing means the piece as photographed. */
export type CartLine = { slug: string; size: Size; qty: number; colour?: string };

export const MAX_QTY = 9;
export const SHIPPING_FREE_OVER = 500;
const SHIPPING_FLAT = 25;

export const lineId = (l: Pick<CartLine, "slug" | "size" | "colour">) => `${l.slug}|${l.size}|${l.colour ?? ""}`;

/** "Champagne · Size M" style label for a bag line. */
export const lineLabel = (l: CartLine) => {
  const p = getProduct(l.slug);
  return p ? `${getColour(p, l.colour).name} · Size ${l.size}` : `Size ${l.size}`;
};

const clampQty = (qty: number) => Math.max(0, Math.min(MAX_QTY, qty));

/**
 * Adds a piece to the bag, merging with an existing line of the same size and colour.
 * The default colourway is stored as "no colour" so old bags and new lines merge cleanly.
 */
export function addLine(
  lines: CartLine[],
  slug: string,
  size: Size,
  opts: { qty?: number; colour?: string } = {},
): CartLine[] {
  const qty = opts.qty ?? 1;
  const p = getProduct(slug);
  const colour = p && opts.colour && opts.colour !== p.colours[0].id ? opts.colour : undefined;
  const id = lineId({ slug, size, colour });
  const hit = lines.find((l) => lineId(l) === id);
  if (hit) return lines.map((l) => (l === hit ? { ...l, qty: clampQty(l.qty + qty) } : l));
  return [...lines, colour ? { slug, size, qty, colour } : { slug, size, qty }];
}

/** Sets a line's quantity (clamped to 0–9); a quantity of 0 removes the line. */
export function setLineQty(lines: CartLine[], id: string, qty: number): CartLine[] {
  return lines.map((l) => (lineId(l) === id ? { ...l, qty: clampQty(qty) } : l)).filter((l) => l.qty > 0);
}

export const subtotalOf = (lines: CartLine[]) =>
  lines.reduce((n, l) => n + (getProduct(l.slug)?.price ?? 0) * l.qty, 0);

export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= SHIPPING_FREE_OVER ? 0 : SHIPPING_FLAT);
