import {
  createCollection,
  safeDeleteCollection,
  unsafeDeleteCollection,
  renameCollection as renameCollectionAction,
  updateCollectionOrder,
} from "@/app/actions";
import { Collection, CollectionInsert } from "@/database/types";
// @ts-ignore
import { createContext, startTransition, useOptimistic } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";

const ORDER_BUFFER = 100;

function orderForReorderedElement(
  orders: number[],
  source: number,
  destination: number
): number {
  if (destination === 0) {
    return orders[0] / 2;
  } else if (destination >= orders.length - 1) {
    return orders[orders.length - 1] + ORDER_BUFFER;
  } else {
    if (destination < source) {
      const before = orders[destination - 1];
      const after = orders[destination];
      return (after - before) / 2 + before;
    } else {
      const before = orders[destination];
      const after = orders[destination + 1];
      return (after - before) / 2 + before;
    }
  }
}

const DEFAULT_COLLECTIONS_CONTEXT: OptimisticCollections = {
  optimisticCollections: [],
  async addCollection() {},
  async unsafeRemoveCollection() {},
  async safeRemoveCollection() {},
  async renameCollection() {},
  async reorderCollection() {},
};

export const CollectionsContext = createContext<OptimisticCollections>(
  DEFAULT_COLLECTIONS_CONTEXT
);

type CollectionAdd = {
  type: "add";
  collection: Omit<CollectionInsert, "order">;
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

type CollectionReorder = {
  type: "reorder";
  id: Collection["id"];
  sourceIndex: number;
  destinationIndex: number;
};

type CollectionUpdate =
  | CollectionAdd
  | CollectionDelete
  | CollectionRename
  | CollectionReorder;

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
  addCollection: (collection: Omit<CollectionInsert, "order">) => Promise<void>;
  unsafeRemoveCollection: (id: number) => Promise<void>;
  safeRemoveCollection: (id: number) => Promise<void>;
  renameCollection: (id: number, newName: string) => Promise<void>;
  reorderCollection: (
    id: number,
    sourceIndex: number,
    destinationIndex: number
  ) => Promise<void>;
};

function handleAdd(
  state: OptimisticCollection[]
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
  state: OptimisticCollection[]
): (del: CollectionDelete) => OptimisticCollection[] {
  return ({ id }) =>
    state.filter((c) => c.type === "abstract" || c.collection.id !== id);
}

function handleRename(
  state: OptimisticCollection[]
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
  state: OptimisticCollection[]
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
  collections: Collection[]
): OptimisticCollections {
  const concreteCollections: OptimisticCollection[] = collections.map(
    (collection) => ({
      type: "concrete",
      id: collection.id,
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
        .with({ type: "add" }, handleAdd(state))
        .with({ type: "delete" }, handleDelete(state))
        .with({ type: "rename" }, handleRename(state))
        .with({ type: "reorder" }, handleReorder(state))
        .exhaustive()
  );

  async function addCollection(collection: Omit<CollectionInsert, "order">) {
    startTransition(() => {
      updateOptimisticCollections({ type: "add", collection });
    });
    toast.success(`Collection "${collection.name}" has been created.`);
    await createCollection(collection);
  }

  async function safeRemoveCollection(id: number) {
    startTransition(() => {
      updateOptimisticCollections({ type: "delete", id });
    });
    toast.success("Collection has been deleted.");
    await safeDeleteCollection(id);
  }

  async function unsafeRemoveCollection(id: number) {
    startTransition(() => {
      updateOptimisticCollections({ type: "delete", id });
    });
    toast.success("Collection has been deleted.");
    await unsafeDeleteCollection(id);
  }

  async function renameCollection(id: number, newName: string) {
    startTransition(() => {
      updateOptimisticCollections({ type: "rename", id, newName });
    });
    toast.success(`Collection has been renamed to ${newName}`);
    await renameCollectionAction(id, newName);
  }

  async function reorderCollection(
    id: number,
    sourceIndex: number,
    destinationIndex: number
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
      destinationIndex
    );

    await updateCollectionOrder(id, order);
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
