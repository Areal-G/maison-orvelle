"use client";
import { useEffect } from "react";
import { PRODUCTS } from "@/lib/products";
import { TopModel } from "./three/Studio";

/** Warm the cache with every piece (~3 MB in total) so turning the ring never waits. */
const AssetsPreload = () => {
  useEffect(() => {
    PRODUCTS.forEach((p) => TopModel.preload(p.slug));
  }, []);
  return null;
};

export default AssetsPreload;
