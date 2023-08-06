"use client";

import Collection from "@/components/collection";
import { Collection as CollectionModel } from "@prisma/client";
import { useParams } from "next/navigation";

export async function Collections({
  collections,
}: {
  collections: CollectionModel[];
}) {
  const { id } = useParams();
  const parentId = Number(id) || null;

  return (
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
  );
}
