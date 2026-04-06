import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-10 w-1/2 rounded-full" />
          <Skeleton className="h-10 w-1/2 rounded-full" />
          <Skeleton className="h-10 w-1/2 rounded-full" />
        </div>
      </div>
    </div>
  );
}
