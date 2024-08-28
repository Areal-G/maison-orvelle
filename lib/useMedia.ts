"use client";
import { useSyncExternalStore } from "react";

/** SSR-safe media query: false on the server and during hydration, live afterwards. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
