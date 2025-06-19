// @ts-ignore
import { createContext, startTransition, useOptimistic } from "react";
import { match } from "ts-pattern";
import type { Collection, CollectionInsert } from "@/database/types";
import { orderForReorderedElement } from "@/lib/order";
import type {
  CollectionAdd,
  CollectionDelete,
  CollectionRename,
  CollectionReorder,
  CollectionRepository,
  CollectionUpdate,
} from "@/repository/collection-repository";

const DEFAULT_COLLECTIONS_CONTEXT: OptimisticCollections = {
  optimisticCollections: [],
  // @ts-ignore
  async addCollection() {},
  async unsafeRemoveCollection() {},
  async safeRemoveCollection() {},
  async renameCollection() {},
  async reorderCollection() {},
};

export const CollectionsContext = createContext(DEFAULT_COLLECTIONS_CONTEXT);

export type AbstractCollection = {
  type: "abstract";
  id: string;
  collection: Pick<Collection, "name" | "order">;
};

export type ConcreteCollection = {
  type: "concrete";
  id: number;
  collection: Collection;
};

export type OptimisticCollection = AbstractCollection | ConcreteCollection;

export type OptimisticCollections = {
  optimisticCollections: OptimisticCollection[];
  addCollection: (
    collection: Omit<CollectionInsert, "order" | "deleted">,
  ) => Promise<Collection | undefined>;
  unsafeRemoveCollection: (id: number) => Promise<void>;
  safeRemoveCollection: (id: number) => Promise<void>;
  renameCollection: (id: number, newName: string) => Promise<void>;
  reorderCollection: (
    id: number,
    sourceIndex: number,
    destinationIndex: number,
  ) => Promise<void>;
};

function handleAdd(
  state: OptimisticCollection[],
): (add: CollectionAdd) => OptimisticCollection[] {
  return ({ collection }) => [
    ...state,
    {
      type: "abstract",
      id: crypto.randomUUID(),
      collection: {
        name: collection.name,
        order: Number.POSITIVE_INFINITY,
      },
    } satisfies AbstractCollection,
  ];
}

function handleDelete(
  state: OptimisticCollection[],
): (del: CollectionDelete) => OptimisticCollection[] {
  return ({ id }) =>
    state.filter((c) => c.type === "abstract" || c.collection.id !== id);
}

function handleRename(
  state: OptimisticCollection[],
): (rename: CollectionRename) => OptimisticCollection[] {
  return ({ id, newName }) =>
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
    });
}

function handleReorder(
  state: OptimisticCollection[],
): (reorder: CollectionReorder) => OptimisticCollection[] {
  return ({ sourceIndex, destinationIndex }) => {
    if (state.length < 2) {
      return state;
    }

    const element = state[sourceIndex];

    const withoutSource = [
      ...state.slice(0, sourceIndex),
      ...state.slice(sourceIndex + 1),
    ];
    return [
      ...withoutSource.slice(0, destinationIndex),
      element,
      ...withoutSource.slice(destinationIndex),
    ];
  };
}

export function useOptimisticCollections(
  collectionRepository: CollectionRepository,
): OptimisticCollections {
  const concreteCollections: OptimisticCollection[] = collectionRepository
    .collections()
    .map((collection) => ({
      type: "concrete",
      id: collection.id,
      collection,
    }));

  const [optimisticCollections, updateOptimisticCollections] = useOptimistic<
    OptimisticCollection[],
    CollectionUpdate
  >(
    concreteCollections,
    (state: OptimisticCollection[], update: CollectionUpdate) =>
      match(update)
        .with({ type: "add" }, handleAdd(state))
        .with({ type: "delete" }, handleDelete(state))
        .with({ type: "rename" }, handleRename(state))
        .with({ type: "reorder" }, handleReorder(state))
        .exhaustive(),
  );

  async function addCollection(
    collection: Omit<CollectionInsert, "order" | "deleted">,
  ) {
    startTransition(() => {
      updateOptimisticCollections({ type: "add", collection });
    });

    const response = await collectionRepository.addCollection(collection);

    return response;
  }

  async function safeRemoveCollection(id: number) {
    // TODO: Get rid of this?
    startTransition(() => {
      updateOptimisticCollections({ type: "delete", id });
    });

    await collectionRepository.safeRemoveCollection(id);
  }

  async function unsafeRemoveCollection(id: number) {
    startTransition(() => {
      updateOptimisticCollections({ type: "delete", id });
    });

    await collectionRepository.unsafeRemoveCollection(id);
  }

  async function renameCollection(id: number, newName: string) {
    startTransition(() => {
      updateOptimisticCollections({ type: "rename", id, newName });
    });

    await collectionRepository.renameCollection(id, newName);
  }

  async function reorderCollection(
    id: number,
    sourceIndex: number,
    destinationIndex: number,
  ) {
    startTransition(() => {
      updateOptimisticCollections({
        type: "reorder",
        id,
        sourceIndex,
        destinationIndex,
      });
    });

    const order = orderForReorderedElement(
      concreteCollections.map((c) => c.collection.order),
      sourceIndex,
      destinationIndex,
    );

    await collectionRepository.reorderCollection(id, order);
  }

  return {
    optimisticCollections,
    addCollection,
    unsafeRemoveCollection,
    safeRemoveCollection,
    renameCollection,
    reorderCollection,
  };
}
