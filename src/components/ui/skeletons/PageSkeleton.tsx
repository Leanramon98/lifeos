import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "./CardSkeleton";
import { ListItemSkeleton } from "./ListItemSkeleton";

export function PageSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-pulse max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-card" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-8 w-40" />
          <div className="bg-surface rounded-card border border-border p-4">
            {[1, 2, 3, 4].map((i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Sidebar / Aside */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
