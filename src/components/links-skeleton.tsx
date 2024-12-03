import { Skeleton } from "./ui/skeleton";

export function LinksSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full opacity-10" />
      <Skeleton className="h-10 w-full opacity-10" />
      <Skeleton className="h-10 w-full opacity-10" />
      <Skeleton className="h-10 w-full opacity-10" />
      <Skeleton className="h-10 w-full opacity-10" />
      <Skeleton className="h-10 w-full opacity-10" />
      <Skeleton className="h-10 w-full opacity-10" />
      <Skeleton className="h-10 w-full opacity-10" />
    </div>
  );
}
