import type { Collection, CollectionInsert } from "@/database/types";

export type CollectionAdd = {
  type: "add";
  collection: Omit<CollectionInsert, "order">;
};

export type CollectionDelete = {
  type: "delete";
  id: Collection["id"];
};

export type CollectionRename = {
  type: "rename";
  id: Collection["id"];
  newName: string;
};

export type CollectionReorder = {
  type: "reorder";
  id: Collection["id"];
  sourceIndex: number;
  destinationIndex: number;
};

export type CollectionUpdate =
  | CollectionAdd
  | CollectionDelete
  | CollectionRename
  | CollectionReorder;

export type CollectionRepository = {
  collections: () => Collection[];
  addCollection: (
    collection: Omit<CollectionInsert, "order" | "deleted">,
  ) => Promise<Collection | undefined>;
  unsafeRemoveCollection: (id: number) => Promise<void>;
  safeRemoveCollection: (id: number) => Promise<void>;
  renameCollection: (id: number, newName: string) => Promise<void>;
  reorderCollection: (id: number, order: number) => Promise<void>;
};
