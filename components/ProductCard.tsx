"use client";
import Link from "next/link";
import { useState } from "react";
import { View } from "@react-three/drei";
import CardStage from "./three/CardStage";
import SaveButton from "./SaveButton";
import { formatPrice, type Product } from "@/lib/products";

/** Shop card with a live 3D turntable of the piece. */
export default function ProductCard({ product, onQuickAdd }: { product: Product; onQuickAdd?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
      >
        <View className="aspect-[4/5] w-full">
          <CardStage product={product} hovered={hovered} />
        </View>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl leading-tight">
            <Link href={`/product/${product.slug}`} className="hover:text-gold transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-muted mt-1">{product.material}</p>
          <ul className="flex gap-1.5 mt-2.5" aria-label={`${product.colours.length} colours`}>
            {product.colours.map((c) => (
              <li
                key={c.id}
                title={c.name}
                className="size-2.5 rounded-full ring-1 ring-ink/15"
                style={{ background: c.hex }}
              />
            ))}
          </ul>
        </div>
        <p className="font-display text-xl tabular-nums">{formatPrice(product.price)}</p>
      </div>
      <SaveButton
        slug={product.slug}
        name={product.name}
        className="absolute left-3 top-3 size-9 justify-center panel rounded-full text-ink hover:text-gold"
      />
      {onQuickAdd && (
        <button
          type="button"
          onClick={onQuickAdd}
          className="absolute right-3 top-3 panel px-3 py-2 text-[10px] tracking-[0.24em] uppercase opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
        >
          Quick add · M
        </button>
      )}
    </article>
  );
}
