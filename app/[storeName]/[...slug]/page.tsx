/**
 * app/[storeName]/[...slug]/page.tsx
 *
 * Catch-all redirect — keeps backward compatibility with any old DB-generated
 * page URLs while the architecture migrates. Unknown slugs fall through to 404.
 *
 * Known slugs are handled by their dedicated filesystem routes (about, contact,
 * blog, cart, home) — Next.js will prefer those over this catch-all.
 */

// TODO: Delete after migration complete - legacy catch-all for old DB-generated URLs
import { redirect, notFound } from "next/navigation";

const STATIC_PAGES = new Set(["home", "about", "contact", "blog", "cart", "store"]);

interface Props {
  params: Promise<{ storeName: string; slug: string[] }>;
}

export default async function CatchAllRoute({ params }: Props) {
  const { storeName, slug } = await params;
  const firstSegment = slug?.[0] ?? "";

  // If it's a known static page that has its own filesystem route, redirect
  // (this path should normally be unreachable for those slugs)
  if (STATIC_PAGES.has(firstSegment)) {
    if (firstSegment === "store") {
      redirect(`/${storeName}`);
    }
    redirect(`/${storeName}/${firstSegment}`);
  }

  // Unknown slug → 404
  notFound();
}
