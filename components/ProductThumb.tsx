/* eslint-disable @next/next/no-img-element -- tiny static posters, no optimisation needed */
import clsx from "clsx";
import { getColour, posterPath, type Product } from "@/lib/products";

/** Still render of a piece on its tint, for the bag and checkout. A chosen colourway shows as a swatch in the corner. */
export default function ProductThumb({
  product,
  colour,
  className,
}: {
  product: Product;
  colour?: string;
  className?: string;
}) {
  const c = colour ? getColour(product, colour) : null;
  return (
    <span className={clsx("relative block overflow-hidden", className)} style={{ background: product.tint }}>
      <img src={posterPath(product.slug)} alt="" className="size-full object-contain" loading="lazy" />
      {c && (
        <span
          className="absolute right-1 bottom-1 size-3 rounded-full ring-1 ring-ivory shadow-sm"
          style={{ background: c.hex }}
          title={c.name}
        />
      )}
    </span>
  );
}
