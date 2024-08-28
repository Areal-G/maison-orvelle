"use client";
import clsx from "clsx";
import { useWishlist } from "@/lib/wishlist";

/** Heart toggle that saves a piece to the wishlist. */
export default function SaveButton({
  slug,
  name,
  className,
  label = false,
}: {
  slug: string;
  name: string;
  className?: string;
  label?: boolean;
}) {
  const { has, toggle } = useWishlist();
  const saved = has(slug);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved pieces` : `Save ${name}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={clsx("group/save inline-flex items-center gap-2 transition-colors", className)}
    >
      <svg
        viewBox="0 0 24 24"
        className={clsx("size-[18px] transition-transform duration-300", saved && "scale-110")}
        aria-hidden="true"
      >
        <path
          d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
          className={clsx(
            "stroke-current transition-[fill] duration-300",
            saved ? "fill-gold stroke-gold" : "fill-transparent group-hover/save:fill-gold/20",
          )}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      {label && <span className="text-[11px] uppercase tracking-[0.28em]">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
