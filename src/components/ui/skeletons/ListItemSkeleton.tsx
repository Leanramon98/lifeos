import { Skeleton } from "@/components/ui/skeleton";

export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-3 border-b border-border last:border-0">
      <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}
