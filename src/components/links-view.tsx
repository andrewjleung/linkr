import prisma from "@/lib/prisma";
import { CreateLinkForm } from "@/components/create-link-form";
import LinkComponent from "@/components/link";
import { Collection as CollectionModel } from "@prisma/client";
import { CreateCollectionForm } from "./create-collection-form";
import Collection from "@/components/collection";
import { Skeleton } from "@/components/ui/skeleton";

async function Collections({
  parentId,
}: {
  parentId: CollectionModel["parentId"];
}) {
  const collections = await prisma.collection.findMany();

  return (
    <>
      {collections.length > 0 ? (
        <ul className="mt-4 flex flex-col space-y-2">
          <Collection
            collection={{ type: "home" }}
            isSelected={parentId === null}
          />
          {collections.map((c) => (
            <Collection
              key={`collection-${c.id}`}
              collection={{ type: "non-home", collection: c }}
              isSelected={c.id === parentId}
            />
          ))}
        </ul>
      ) : (
        <h2>There&apos;s nothing here!</h2>
      )}
    </>
  );
}

function CollectionsSkeleton() {
  return (
    <div className="mt-4 flex flex-col space-y-2">
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex h-10 w-full items-center justify-center">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

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
        <h2>There&apos;s nothing here!</h2>
      )}
    </>
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
      <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-4 gap-8 p-8">
        <div className="col-span-1">
          <CreateCollectionForm />
          {loading ? (
            <CollectionsSkeleton />
          ) : (
            <Collections parentId={parentId} />
          )}
        </div>
        <div className="col-span-3">
          <CreateLinkForm parentId={parentId} />
          {loading ? null : <Links parentId={parentId} />}
        </div>
      </div>
    </>
  );
}
