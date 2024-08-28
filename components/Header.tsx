"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import BrandLogo from "./BrandLogo";
import MusicStreamLine from "./MusicStreamLine";

const NAV = [
  { href: "/", label: "Atelier" },
  { href: "/shop", label: "Shop" },
];

const Header = () => {
  const pathname = usePathname();
  const { count, open } = useCart();
  const { slugs } = useWishlist();
  return (
    <header className="fixed z-30 inset-x-0 top-0 flex justify-between items-center md:px-14 px-4 md:py-6 py-4 text-ink pointer-events-none bg-gradient-to-b from-ivory/90 via-ivory/50 to-ivory/0">
      <Link href="/" aria-label="Orvelle home" className="pointer-events-auto">
        <BrandLogo />
      </Link>
      <nav
        aria-label="Main"
        className="pointer-events-auto flex items-center md:gap-9 gap-4 text-[10px] md:text-[11px] font-medium tracking-[0.28em] uppercase"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={clsx(
              "hover-animation py-2",
              pathname === item.href && "opacity-100 underline underline-offset-8 decoration-gold",
            )}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/wishlist"
          aria-current={pathname === "/wishlist" ? "page" : undefined}
          aria-label={`Saved pieces, ${slugs.length}`}
          className={clsx(
            "hover-animation py-2 flex items-center gap-1.5",
            pathname === "/wishlist" && "opacity-100 underline underline-offset-8 decoration-gold",
          )}
        >
          <svg viewBox="0 0 24 24" className="size-3.5 md:hidden" aria-hidden="true">
            <path
              d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
              fill={slugs.length ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          <span className="max-md:hidden">Saved</span>
          {slugs.length > 0 && <span className="tabular-nums max-md:hidden">({slugs.length})</span>}
        </Link>
        <button
          type="button"
          onClick={open}
          className="hover-animation py-2 uppercase tracking-[0.28em]"
          aria-label={`Open bag, ${count} items`}
        >
          Bag <span className="tabular-nums">({count})</span>
        </button>
        <MusicStreamLine />
      </nav>
    </header>
  );
};

export default Header;
