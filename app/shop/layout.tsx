import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop", description: "All nine Strayline track tops, rendered live in 3D." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
