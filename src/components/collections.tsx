import Collection from "@/components/collection";
import prisma from "@/lib/prisma";
import { Collection as CollectionModel } from "@prisma/client";

export async function Collections({
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
