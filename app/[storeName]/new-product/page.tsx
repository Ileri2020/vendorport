import { notFound } from "next/navigation";
import { getCachedBusiness } from "@/lib/getBusinessBySlug";
import PlatformProductWorkspace from "@/components/platform/PlatformProductWorkspace";

export default async function StoreNewProductPage({ params }: { params: Promise<{ storeName: string }> }) {
  const { storeName } = await params;
  const business = await getCachedBusiness(storeName);
  if (!business) notFound();

  return <PlatformProductWorkspace business={{ id: business.id, ownerId: business.ownerId, name: business.name }} />;
}
