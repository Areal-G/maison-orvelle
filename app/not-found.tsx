import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative z-10 min-h-screen grid place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="font-display italic text-6xl md:text-8xl mt-3">Not on the rail</h1>
        <p className="text-muted mt-4">That piece isn&apos;t here, or it has already left the atelier.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Back to the boutique
        </Link>
      </div>
    </main>
  );
}
