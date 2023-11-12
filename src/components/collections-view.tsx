"use client";

import { CreateCollectionForm } from "@/components/collection-form";
import { Collections } from "@/components/collections";
import { useOptimisticCollections } from "@/hooks/use-optimistic-collections";
import { Collection } from "@prisma/client";

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
