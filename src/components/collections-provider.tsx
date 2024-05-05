"use client";

import {
  useOptimisticCollections,
  CollectionsContext,
} from "@/hooks/use-optimistic-collections";
import type { Collection } from "@/database/types";

export default function CollectionsProvider({
  collections,
  children,
}: {
  collections: Collection[];
  children: React.ReactNode;
}) {
  const oc = useOptimisticCollections(collections);

  return (
    <CollectionsContext.Provider value={oc}>
      {children}
    </CollectionsContext.Provider>
  );
}
