import {
  createCollection,
  renameCollection,
  safeDeleteCollection,
  unsafeDeleteCollection,
  updateCollectionOrder,
} from "@/app/actions";
import type { Collection } from "@/database/types";
import type { CollectionRepository } from "./collection-repository";

function discard<U extends unknown[], R>(fn: (...args: U) => Promise<R>) {
  return (...args: U) =>
    fn(...args).then(() => {
      return;
    });
}

export default function databaseCollectionStore(
  collections: Collection[],
): CollectionRepository {
  return {
    collections: () => collections,
    addCollection: createCollection,
    unsafeRemoveCollection: unsafeDeleteCollection,
    safeRemoveCollection: safeDeleteCollection,
    renameCollection: discard(renameCollection),
    reorderCollection: discard(updateCollectionOrder),
  };
}
