import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ViewCanvas from "@/components/ViewCanvas";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { BRAND } from "@/lib/brand";

const jost = localFont({
  src: [
    { path: "../public/fonts/Jost-Regular.woff", weight: "400" },
    { path: "../public/fonts/Jost-Medium.woff", weight: "500" },
  ],
  variable: "--font-jost",
  display: "swap",
});
const cormorant = localFont({
  src: [
    { path: "../public/fonts/Cormorant-Medium.woff", weight: "500" },
    { path: "../public/fonts/Cormorant-MediumItalic.woff", weight: "500", style: "italic" },
    { path: "../public/fonts/Cormorant-SemiBold.woff", weight: "600" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const title = `${BRAND.house} — Women's Tops in 3D`;

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3807"),
  title: { default: title, template: `%s · ${BRAND.house}` },
  description: BRAND.description,
  openGraph: { title, description: BRAND.tagline, siteName: BRAND.house, type: "website" },
};

export const viewport: Viewport = { themeColor: "#f4efe8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <a href="#content" className="sr-only-focusable fixed left-4 top-4 z-[60] btn-primary">
          Skip to content
        </a>
        <CartProvider>
          <WishlistProvider>
            <ViewCanvas />
            <Header />
            <div id="content">{children}</div>
            <CartDrawer />
            <LoadingSkeleton />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
