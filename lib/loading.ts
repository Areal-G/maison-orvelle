import { useEffect, useSyncExternalStore } from "react";

/** Tiny store: true while any 3D view is suspended (waiting on models/textures). */
let pending = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const useScenePending = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => pending > 0,
    () => true,
  );

/** Mount as a Suspense fallback inside the canvas. */
export function SuspenseSignal() {
  useEffect(() => {
    pending++;
    emit();
    return () => {
      pending--;
      emit();
    };
  }, []);
  return null;
}
