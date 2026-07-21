/**
 * app/[storeName]/layout.tsx
 *
 * Layout for all business-scoped pages under /[storeName]/...
 * (e.g. /healthclique/store, /healthclique/about, /healthclique/products)
 *
 * This server layout:
 *  1. Reads the `storeName` URL param
 *  2. Fetches the matching Business from the DB (cached, 5-min revalidation)
 *  3. Passes `business`, `businessId`, and `basePath` as explicit props to
 *     Navbar and Footer so their UI is fully branded for that store.
 *
 * Navbar and Footer here will look completely different from the platform
 * equivalents rendered by (platform)/layout.tsx.
 */

import { notFound } from "next/navigation";
import { getCachedBusiness } from "@/lib/getBusinessBySlug";
import Navbar from "@/components/utility/navbar";
import { Footer } from "@/components/myComponents/subs/footer";
import BusinessContextProvider from "@/components/platform/BusinessContextProvider";
import ColorInjector from "@/components/platform/ColorInjector";
import { CartProvider } from "@/hooks/use-cart";

export const revalidate = 300;

interface Props {
  children: React.ReactNode;
  params: Promise<{ storeName: string }>;
}

export default async function BusinessLayout({ children, params }: Props) {
  const { storeName } = await params;
  const business = await getCachedBusiness(storeName);

  if (!business) {
    notFound();
  }

  const basePath = `/${storeName}`;

  return (
    <CartProvider businessSlug={business.name}>
      <BusinessContextProvider business={business}>
        <ColorInjector />
        <Navbar
          basePath={basePath}
          business={business}
          businessId={business.id}
        />
        {children}
        <Footer
          basePath={basePath}
          business={business}
          businessId={business.id}
        />
      </BusinessContextProvider>
    </CartProvider>
  );
}
