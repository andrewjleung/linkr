import prisma from "@/lib/prisma";
import LinkComponent from "@/components/link";
import { Collection as CollectionModel } from "@prisma/client";
import { Skeleton } from "./ui/skeleton";

export async function Links({
  parentId,
}: {
  parentId: CollectionModel["parentId"];
}) {
  const links = await prisma.link.findMany({ where: { parentId } });

  return (
    <>
      {links.length > 0 ? (
        <div className="flex flex-col gap-4">
          {links
            .sort((a, b) => a.url.localeCompare(b.url))
            .map((l) => (
              <LinkComponent key={`link-${l.id}`} link={l} />
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
