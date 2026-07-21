/**
 * app/[storeName]/page.tsx  →  vendorport.com/[store-name]
 *
 * DEFAULT ROUTE — renders the business STORE page UI as the default storefront.
 *
 * Note: business fetching, Navbar, Footer, and BusinessContextProvider are all
 * handled by the parent layout (app/[storeName]/layout.tsx), so this page only
 * needs to handle the suspended-store guard and render the Store UI.
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedBusiness } from "@/lib/getBusinessBySlug";
import Store from "./store/page";

export const revalidate = 300;

interface Props {
  params: Promise<{ storeName: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeName } = await params;
  const business = await getCachedBusiness(storeName);

  if (!business) {
    return { title: "Store Not Found | VendorPort" };
  }

  return {
    title: `${business.name} | VendorPort`,
    description:
      business.siteSettings?.aboutText ??
      `Shop the latest products from ${business.name}`,
    openGraph: {
      title: business.name,
      description: business.siteSettings?.aboutText ?? "",
      images: business.siteSettings?.heroImage ? [business.siteSettings.heroImage] : [],
    },
  };
}

export default async function StoreDefaultPage({ params }: Props) {
  const { storeName } = await params;
  const business = await getCachedBusiness(storeName);

  if (!business) {
    notFound();
  }

  if (business.isArchived) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4 space-y-4">
        <h1 className="text-3xl font-extrabold">Store Suspended</h1>
        <p className="text-muted-foreground max-w-md">
          &quot;{business.name}&quot; has been temporarily suspended by the platform. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="flex-1">
        <Store />
      </main>
    </div>
  );
}
