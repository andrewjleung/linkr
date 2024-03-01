"use client";

import { CreateCollectionForm } from "@/components/collection-form";
import { Collections } from "@/components/collections";
import { Collection } from "@/database/types";
import {
  CollectionsContext,
  useOptimisticCollections,
} from "@/hooks/use-optimistic-collections";
import { CommandMenu } from "./command-menu";
import { useAtom } from "jotai";
import { showSidebarAtom } from "@/state";

export function CollectionsView({
  unoptimisticCollections,
}: {
  unoptimisticCollections: Collection[];
}) {
  const oc = useOptimisticCollections(unoptimisticCollections);
  const [showSidebar] = useAtom(showSidebarAtom);

  return (
    <CollectionsContext.Provider value={oc}>
      {showSidebar ? <Collections /> : null}
      <CreateCollectionForm />
      <CommandMenu />
    </CollectionsContext.Provider>
  );
}
