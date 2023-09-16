import {
  createCollection,
  safeDeleteCollection,
  unsafeDeleteCollection,
  renameCollection as renameCollectionAction,
} from "@/app/actions";
import { Prisma, Collection } from "@prisma/client";
import { experimental_useOptimistic as useOptimistic } from "react";
import { match } from "ts-pattern";

type CollectionAdd = {
  type: "add";
  collection: Prisma.CollectionCreateInput;
};

type CollectionDelete = {
  type: "delete";
  id: Collection["id"];
};

type CollectionRename = {
  type: "rename";
  id: Collection["id"];
  newName: string;
};

type CollectionUpdate = CollectionAdd | CollectionDelete | CollectionRename;

type AbstractCollection = {
  type: "abstract";
  tempId: string;
  collection: Prisma.CollectionCreateInput;
};

type ConcreteCollection = {
  type: "concrete";
  collection: Collection;
};

export type OptimisticCollection = AbstractCollection | ConcreteCollection;

type OptimisticCollections = {
  optimisticCollections: OptimisticCollection[];
  addCollection: (collection: Prisma.CollectionCreateInput) => Promise<void>;
  unsafeRemoveCollection: (id: number) => Promise<void>;
  safeRemoveCollection: (id: number) => Promise<void>;
  renameCollection: (id: number, newName: string) => Promise<void>;
};

export function useOptimisticCollections(
  collections: Collection[]
): OptimisticCollections {
  const concreteCollections: OptimisticCollection[] = collections.map(
    (collection) => ({
      type: "concrete",
      collection,
    })
  );

  const [optimisticCollections, updateOptimisticCollections] = useOptimistic<
    OptimisticCollection[],
    CollectionUpdate
  >(
    concreteCollections,
    (state: OptimisticCollection[], update: CollectionUpdate) =>
      match(update)
        .with({ type: "add" }, ({ collection }) => [
          ...state,
          {
            type: "abstract",
            tempId: crypto.randomUUID(),
            collection,
          } satisfies AbstractCollection,
        ])
        .with({ type: "delete" }, ({ id }) =>
          state.filter((c) => c.type === "abstract" || c.collection.id !== id)
        )
        .with({ type: "rename" }, ({ id, newName }) =>
          state.map((c) => {
            if (c.type === "abstract") {
              return c;
            }

            if (c.collection.id === id) {
              return {
                ...c,
                collection: {
                  ...c.collection,
                  name: newName,
                },
              };
            }

            return c;
          })
        )
        .exhaustive()
  );

  async function addCollection(collection: Prisma.CollectionCreateInput) {
    updateOptimisticCollections({ type: "add", collection });
    await createCollection(collection);
  }

  async function safeRemoveCollection(id: number) {
    updateOptimisticCollections({ type: "delete", id });
    await safeDeleteCollection(id);
  }

  async function unsafeRemoveCollection(id: number) {
    updateOptimisticCollections({ type: "delete", id });
    await unsafeDeleteCollection(id);
  }

  async function renameCollection(id: number, newName: string) {
    updateOptimisticCollections({ type: "rename", id, newName });
    await renameCollectionAction(id, newName);
  }

  return {
    optimisticCollections,
    addCollection,
    unsafeRemoveCollection,
    safeRemoveCollection,
    renameCollection,
  };
}
