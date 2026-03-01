import PlatformHome from "@/components/platform/PlatformHome";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const businesses = await prisma.business.findMany({
    include: { 
      owner: {
        select: {
          name: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="w-full">
      <PlatformHome businesses={businesses as any} />
    </div>
  );
}
