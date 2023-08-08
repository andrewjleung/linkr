"use client";

import { Collection, HomeCollection } from "@/components/collection";
import { KEYPRESSES, KeyboardContext } from "@/hooks/use-keyboard";
import { Collection as CollectionModel } from "@prisma/client";
import { useContext, useState } from "react";

export function Collections({
  collections,
}: {
  collections: CollectionModel[];
}) {
  const [editingCollection, setEditingCollection] = useState<number | null>(
    null
  );

  return (
    <div className="mt-4 flex flex-col space-y-2">
      <HomeCollection />
      {collections.map((c) => (
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
