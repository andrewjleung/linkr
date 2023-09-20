import { Collection, HomeCollection } from "@/components/collection";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { OptimisticCollection } from "@/hooks/use-optimistic-collections";

export function Collections({
  optimisticCollections,
  unsafeRemoveCollection,
  renameCollection,
}: {
  optimisticCollections: OptimisticCollection[];
  unsafeRemoveCollection: (id: number) => Promise<void>;
  renameCollection: (id: number, newName: string) => Promise<void>;
}) {
  const [editingCollection, setEditingCollection] = useState<number | null>(
    null
  );

  return (
    <div className="flex flex-col space-y-2">
      <HomeCollection />
      <Separator />
      {optimisticCollections.map((c) => (
        <Collection
          key={
            c.type === "abstract"
              ? `abstract-collection-${c.tempId}`
              : `concrete-collection-${c.collection.id}`
          }
          optimisticCollection={c}
          editingCollection={editingCollection}
          setEditingCollection={setEditingCollection}
          unsafeRemoveCollection={unsafeRemoveCollection}
          renameCollection={renameCollection}
        />
      ))}
    </div>
  );
}
