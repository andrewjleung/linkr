"use client";

import { useCallback } from "react";
import type { Collection } from "@/database/types";
import { useCollectionStore } from "@/hooks/use-collection-store";
import {
  CollectionsContext,
  type OptimisticCollections,
  useOptimisticCollections,
} from "@/hooks/use-optimistic-collections";
import { orderForReorderedElement } from "@/lib/order";
import type { CollectionRepository } from "@/repository/collection-repository";
import databaseCollectionStore from "@/repository/database-collection-repository";

export function DatabaseCollectionsProvider({
  collections,
  children,
}: {
  collections: Collection[];
  children: React.ReactNode;
}) {
  const collectionStore = databaseCollectionStore(collections);
  const oc = useOptimisticCollections(collectionStore);

  return (
    <CollectionsContext.Provider value={oc}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function DemoCollectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const collectionRepository = useCollectionStore();
  const wrap = useCallback(
    (collectionRepository: CollectionRepository): OptimisticCollections => {
      return {
        optimisticCollections: collectionRepository.collections().map((c) => ({
          type: "concrete",
          id: c.id,
          collection: c,
        })),
        addCollection: collectionRepository.addCollection,
        unsafeRemoveCollection: collectionRepository.unsafeRemoveCollection,
        safeRemoveCollection: collectionRepository.safeRemoveCollection,
        renameCollection: collectionRepository.renameCollection,
        reorderCollection: async (
          id: number,
          sourceIndex,
          destinationIndex,
        ) => {
          const order = orderForReorderedElement(
            collectionRepository.collections().map((c) => c.order),
            sourceIndex,
            destinationIndex,
          );

          collectionRepository.reorderCollection(id, order);
        },
      };
    },
    [],
  );

  return (
    <CollectionsContext.Provider value={wrap(collectionRepository)}>
      {children}
    </CollectionsContext.Provider>
  );
}
