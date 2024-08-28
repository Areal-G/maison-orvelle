"use client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useWishlist } from "@/lib/wishlist";
import { getProduct } from "@/lib/products";

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const saved = slugs.map(getProduct).filter((p) => p !== undefined);

  return (
    <main className="relative z-10 min-h-screen flex flex-col">
      <section className="px-4 md:px-14 pt-32 md:pt-40 pb-10">
        <p className="eyebrow">Kept for later</p>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.9] mt-3">
          Saved <em>pieces</em>
        </h1>
        <p className="max-w-md text-sm text-muted mt-5" aria-live="polite">
          {saved.length
            ? `${saved.length} ${saved.length === 1 ? "piece" : "pieces"} saved in this browser.`
            : "Nothing saved yet. Tap the heart on any piece to keep it here."}
        </p>
      </section>

      {saved.length ? (
        <section aria-label="Saved pieces" className="px-4 md:px-14 pb-24 flex-1">
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="px-4 md:px-14 pb-24 flex-1">
          <div className="border-t border-ink/10 pt-10">
            <Link href="/shop" className="btn-primary">
              Browse the shop
            </Link>
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}
