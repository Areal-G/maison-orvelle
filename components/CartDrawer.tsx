"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useCart, shippingFor, lineId, lineLabel, SHIPPING_FREE_OVER } from "@/lib/cart";
import { formatPrice, getProduct } from "@/lib/products";
import ProductThumb from "./ProductThumb";

export default function CartDrawer() {
  const { lines, isOpen, close, setQty, remove, subtotal, count } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [isOpen, close]);

  const toFree = Math.max(0, SHIPPING_FREE_OVER - subtotal);

  return (
    <div
      className={clsx("fixed inset-0 z-50", isOpen ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!isOpen}
    >
      <div
        className={clsx(
          "absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className={clsx(
          "absolute right-0 top-0 h-full w-full max-w-md bg-ivory text-ink border-l border-ink/10 flex flex-col outline-none transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
          <h2 className="font-display text-2xl">Your bag ({count})</h2>
          <button type="button" onClick={close} className="hover-animation text-xs tracking-[0.2em] uppercase py-2">
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 grid place-items-center px-6 text-center">
            <div>
              <p className="text-muted text-sm">Your bag is empty.</p>
              <Link href="/shop" onClick={close} className="btn-primary mt-6 inline-flex">
                Browse the shop
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="px-6 pt-4 eyebrow">
              {toFree > 0 ? `${formatPrice(toFree)} away from complimentary shipping` : "Complimentary shipping"}
            </p>
            <ul className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {lines.map((l) => {
                const p = getProduct(l.slug)!;
                return (
                  <li key={lineId(l)} className="flex gap-4 border-b border-ink/10 pb-4">
                    <ProductThumb product={p} colour={l.colour} className="w-16 h-20 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={close}
                        className="block font-display text-lg leading-tight truncate hover:text-gold"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted mt-0.5">{lineLabel(l)}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-ink/20">
                          <button
                            type="button"
                            className="px-3 py-1 hover-animation"
                            aria-label={`Decrease quantity of ${p.name}`}
                            onClick={() => setQty(lineId(l), l.qty - 1)}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            className="px-3 py-1 hover-animation"
                            aria-label={`Increase quantity of ${p.name}`}
                            onClick={() => setQty(lineId(l), l.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm tabular-nums">{formatPrice(p.price * l.qty)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(lineId(l))}
                      className="self-start text-muted hover:text-ink text-xs"
                      aria-label={`Remove ${p.name}`}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-ink/10 px-6 py-5 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {shippingFor(subtotal) ? formatPrice(shippingFor(subtotal)) : "Complimentary"}
                </span>
              </div>
              <Link href="/checkout" onClick={close} className="btn-primary w-full mt-4">
                Checkout · {formatPrice(subtotal + shippingFor(subtotal))}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
