import { Card, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function LinksSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Skeleton
            key={`link-skeleton-${i}`}
            className="h-10 w-full opacity-10"
          />
        ))}
    </div>
  );
}
