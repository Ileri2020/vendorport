import PlatformHome from "@/components/platform/PlatformHome";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export default async function Home() {
  const session = await getSession();
  const isSupreme = session?.user?.role === "supreme";

  const businesses = await prisma.business.findMany({
    include: { 
      owner: {
        select: {
          name: true,
          image: true
        }
      }
    },
    where: isSupreme ? {} : { isArchived: false }, // Show all to supreme only, regular users see only active businesses
    orderBy: { ratings: "desc" }
  });

  return (
    <div className="w-full">
      <PlatformHome businesses={businesses as any} isAdmin={isSupreme} />
    </div>
  );
}
