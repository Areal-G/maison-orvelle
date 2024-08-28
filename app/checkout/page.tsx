"use client";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";
import ProductThumb from "@/components/ProductThumb";
import { useCart, shippingFor, lineId, lineLabel } from "@/lib/cart";
import { formatPrice, getProduct } from "@/lib/products";

type Order = { id: string; total: number; email: string; items: number };

const Field = ({
  label,
  name,
  type = "text",
  autoComplete,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  className?: string;
}) => (
  <label className={className}>
    <span className="block text-[11px] tracking-[0.2em] uppercase text-muted mb-1.5">{label}</span>
    <input
      required
      name={name}
      type={type}
      autoComplete={autoComplete}
      className="w-full bg-transparent border border-ink/20 px-4 py-3 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
    />
  </label>
);

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const shipping = shippingFor(subtotal);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    const id = "ORV-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setOrder({ id, total, email, items: lines.reduce((n, l) => n + l.qty, 0) });
    clear();
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="relative z-10 min-h-screen text-ink">
      <div className="px-4 md:px-16 pt-28 md:pt-36 pb-20 max-w-6xl mx-auto">
        {order ? (
          <section className="max-w-lg" aria-live="polite">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold">Order confirmed</p>
            <h1 className="font-display text-5xl md:text-7xl mt-3 leading-[0.95]">Merci — it&apos;s yours.</h1>
            <p className="text-muted mt-5 text-sm leading-relaxed">
              Order <strong className="text-ink">{order.id}</strong> · {order.items} item{order.items === 1 ? "" : "s"}{" "}
              · {formatPrice(order.total)}. A confirmation would be sent to {order.email}.
            </p>
            <p className="mt-4 text-xs text-muted">This is a demo store: no payment was taken and nothing will ship.</p>
            <Link href="/shop" className="btn-primary mt-8">
              Keep shopping
            </Link>
          </section>
        ) : lines.length === 0 ? (
          <section>
            <h1 className="font-display text-5xl md:text-7xl">Checkout</h1>
            <p className="text-muted mt-4">Your bag is empty.</p>
            <Link href="/shop" className="btn-primary mt-8">
              Browse the shop
            </Link>
          </section>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
            <form onSubmit={submit} className="space-y-8">
              <h1 className="font-display text-5xl md:text-7xl">Checkout</h1>
              <p className="border border-gold/50 bg-gold/10 px-4 py-3 text-xs">
                Demo store — no payment details are collected and no order is placed.
              </p>
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="font-display text-2xl mb-4">Contact</legend>
                <Field label="Full name" name="name" autoComplete="name" className="sm:col-span-2" />
                <Field label="Email" name="email" type="email" autoComplete="email" className="sm:col-span-2" />
              </fieldset>
              <fieldset className="grid gap-4 sm:grid-cols-6">
                <legend className="font-display text-2xl mb-4">Shipping address</legend>
                <Field label="Street address" name="address" autoComplete="street-address" className="sm:col-span-6" />
                <Field label="City" name="city" autoComplete="address-level2" className="sm:col-span-3" />
                <Field label="Postcode" name="postcode" autoComplete="postal-code" className="sm:col-span-1" />
                <Field label="Country" name="country" autoComplete="country-name" className="sm:col-span-2" />
              </fieldset>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Place demo order · {formatPrice(total)}
              </button>
            </form>

            <aside
              aria-label="Order summary"
              className="border border-ink/10 bg-stone/40 p-6 h-fit lg:sticky lg:top-28"
            >
              <h2 className="font-display text-2xl">Summary</h2>
              <ul className="mt-5 space-y-4">
                {lines.map((l) => {
                  const p = getProduct(l.slug)!;
                  return (
                    <li key={lineId(l)} className="flex items-center gap-3">
                      <ProductThumb product={p} colour={l.colour} className="w-12 h-14" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted">
                          {lineLabel(l)} · ×{l.qty}
                        </p>
                      </div>
                      <span className="text-sm tabular-nums">{formatPrice(p.price * l.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm">
                <div className="flex justify-between text-muted">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums">{shipping ? formatPrice(shipping) : "Complimentary"}</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Est. tax</dt>
                  <dd className="tabular-nums">{formatPrice(tax)}</dd>
                </div>
                <div className="flex justify-between font-bold pt-2 text-base">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
