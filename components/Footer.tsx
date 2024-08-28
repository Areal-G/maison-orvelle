import Link from "next/link";
import clsx from "clsx";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/info#shipping", label: "Shipping" },
  { href: "/info#returns", label: "Returns" },
  { href: "/info#credits", label: "Credits" },
  { href: "/info#privacy", label: "Privacy" },
];

/** `overlay` sits over a full-screen 3D view; the default flows at the end of a page. */
export default function Footer({ overlay }: { overlay?: boolean }) {
  return (
    <footer
      className={clsx(
        "flex flex-wrap items-center md:gap-7 gap-x-4 gap-y-2 md:px-14 px-4 text-[10px] tracking-[0.26em] uppercase text-muted",
        overlay ? "absolute z-20 inset-x-0 bottom-0 pb-4" : "relative py-10 border-t border-ink/10",
      )}
    >
      <p>
        © {BRAND.year} {BRAND.house}
      </p>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className="hover:text-ink transition-colors">
          {l.label}
        </Link>
      ))}
    </footer>
  );
}
