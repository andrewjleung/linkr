import prisma from "@/lib/prisma";
import { CreateLinkForm } from "@/components/create-link-form";
import LinkComponent from "@/components/link";
import { Collection as CollectionModel } from "@prisma/client";
import { Skeleton } from "./ui/skeleton";

async function Links({ parentId }: { parentId: CollectionModel["parentId"] }) {
  const links = await prisma.link.findMany({ where: { parentId } });

  return (
    <>
      {links.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {links.map((l) => (
            <LinkComponent key={`link-${l.id}`} link={l} />
          ))}
        </ul>
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

function LinksSkeleton() {
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

export default function LinksView({
  parentId,
  loading,
}: {
  parentId: CollectionModel["parentId"];
  loading?: boolean;
}) {
  return (
    <>
      <div className="col-span-3">
        <CreateLinkForm parentId={parentId} />
        {loading ? <LinksSkeleton /> : <Links parentId={parentId} />}
      </div>
    </>
  );
}
