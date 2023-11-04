import LinkComponent from "@/components/link";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimisticLink, OptimisticLinks } from "@/hooks/use-optimistic-links";

export function Links({
  optimisticLinks,
  removeOptimisticLink,
}: {
  optimisticLinks: OptimisticLink[];
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
}) {
  return (
    <>
      {optimisticLinks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {optimisticLinks
            .sort((a, b) => a.link.url.localeCompare(b.link.url))
            .map((l, i) => (
              <LinkComponent
                key={`link-${i}`}
                optimisticLink={l}
                removeOptimisticLink={removeOptimisticLink}
              />
            ))}
        </div>
      ) : (
        <div className="flex h-1/4 w-full flex-col items-center justify-center gap-2">
          <h1 className="text-4xl">There&apos;s nothing here! 🙀</h1>
          <p className="text-sm">
            The world is your oyster. Go find some links!
          </p>
        </div>
      )}
    </>
  );
}

export function LinksSkeleton() {
  return (
    <div className="mt-4 space-y-2">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <div
            key={`links-skeleton-${i}`}
            className="flex h-10 w-full items-center justify-center"
          >
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
    </div>
  );
}
