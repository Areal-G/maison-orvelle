import clsx from "clsx";
import { BRAND } from "@/lib/brand";

/** The Orvelle monogram: an open ring crossed by a fine needle line. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      <circle cx="20" cy="20" r="13" strokeWidth="1.6" />
      <path d="M20 3v34" strokeWidth="1" />
      <path d="M20 3l2 3h-4z" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}

export default function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <BrandMark className="size-7" />
      <span className="font-display text-xl md:text-2xl tracking-[0.34em] leading-none font-medium max-[420px]:sr-only">
        {BRAND.wordmark}
      </span>
    </span>
  );
}
