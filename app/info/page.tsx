import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = { title: "Info" };

const SECTIONS = [
  {
    id: "shipping",
    title: "Shipping",
    body: "Shipping is complimentary on orders over $500; below that it is a flat $25. Every piece is wrapped in tissue and dispatched within three working days.",
  },
  {
    id: "returns",
    title: "Returns",
    body: "Unworn pieces with their tags can be returned within 30 days. Our tops are cut true to size; corsets and bustiers are best chosen by your waist measurement.",
  },
  {
    id: "privacy",
    title: "Privacy",
    body: `${BRAND.house} is a demo boutique. It runs no analytics or tracking. Your bag and saved pieces are kept only in this browser's local storage, and the checkout form never leaves your device.`,
  },
];

export default function InfoPage() {
  return (
    <main className="relative z-10 min-h-screen">
      <div className="px-4 md:px-14 pt-32 md:pt-40 pb-20 max-w-3xl">
        <p className="eyebrow">Client services</p>
        <h1 className="font-display text-6xl md:text-8xl mt-3">Info</h1>
        <div className="mt-14 space-y-14">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="font-display text-3xl">{s.title}</h2>
              <p className="mt-3 text-muted leading-relaxed">{s.body}</p>
            </section>
          ))}
          <section id="credits" className="scroll-mt-32">
            <h2 className="font-display text-3xl">3D model credits</h2>
            <p className="mt-3 text-muted leading-relaxed">
              The garments shown are based on 3D models shared under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                className="underline underline-offset-4 hover:text-ink"
                rel="license noopener"
                target="_blank"
              >
                CC BY 4.0
              </a>
              . They were compressed for the web and renamed for this store. Some were also trimmed (display stands and
              extra garments removed), recoloured, or cleaned of third-party logos.
            </p>
            <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10 text-sm">
              {PRODUCTS.map((p) => (
                <li key={p.slug} className="py-3 flex flex-wrap justify-between gap-x-6 gap-y-1">
                  <span>{p.name}</span>
                  <span className="text-muted">
                    <a
                      href={`https://sketchfab.com/models/${p.credit.uid}`}
                      className="underline underline-offset-4 hover:text-ink"
                      target="_blank"
                      rel="noopener"
                    >
                      “{p.credit.title}”
                    </a>{" "}
                    by {p.credit.author}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
