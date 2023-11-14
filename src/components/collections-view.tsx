"use client";

import { CreateCollectionForm } from "@/components/collection-form";
import { Collections } from "@/components/collections";
import { Collection } from "@/database/types";
import { useOptimisticCollections } from "@/hooks/use-optimistic-collections";

export function CollectionsView({
  unoptimisticCollections,
}: {
  unoptimisticCollections: Collection[];
}) {
  const {
    optimisticCollections,
    addCollection,
    unsafeRemoveCollection,
    renameCollection,
    reorderCollection,
  } = useOptimisticCollections(unoptimisticCollections);

  return (
    <>
      <CreateCollectionForm addCollection={addCollection} />
      <Collections
        optimisticCollections={optimisticCollections}
        unsafeRemoveCollection={unsafeRemoveCollection}
        renameCollection={renameCollection}
        reorderCollection={reorderCollection}
      />
    </>
  );
}
