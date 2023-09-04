"use client";

import { Collection, HomeCollection } from "@/components/collection";
import { Collection as CollectionModel } from "@prisma/client";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export function Collections({
  collections,
}: {
  collections: CollectionModel[];
}) {
  const [editingCollection, setEditingCollection] = useState<number | null>(
    null
  );

  return (
    <div className="flex flex-col space-y-2">
      <HomeCollection />
      <Separator />
      {collections
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => (
          <Collection
            key={`collection-${c.id}`}
            collection={c}
            isEditing={editingCollection === c.id}
            setIsEditing={(isEditing: boolean) =>
              setEditingCollection(isEditing ? c.id : null)
            }
          />
        ))}
    </div>
  );
}
