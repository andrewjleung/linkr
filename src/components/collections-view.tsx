"use client";

import { CreateCollectionForm } from "@/components/collection-form";
import { Collections } from "@/components/collections";
import { Collection } from "@/database/types";
import {
  CollectionsContext,
  useOptimisticCollections,
} from "@/hooks/use-optimistic-collections";

export function CollectionsView({
  unoptimisticCollections,
}: {
  unoptimisticCollections: Collection[];
}) {
  const oc = useOptimisticCollections(unoptimisticCollections);

  return (
    <CollectionsContext.Provider value={oc}>
      <CreateCollectionForm />
      <Collections />
    </CollectionsContext.Provider>
  );
}
