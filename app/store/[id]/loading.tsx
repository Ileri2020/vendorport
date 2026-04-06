import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[520px] w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-full" />
          <Skeleton className="h-8 w-1/2 rounded-full" />
          <Skeleton className="h-8 w-1/3 rounded-full" />
          <Skeleton className="h-14 w-full rounded-3xl" />
          <Skeleton className="h-14 w-full rounded-3xl" />
          <Skeleton className="h-14 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
