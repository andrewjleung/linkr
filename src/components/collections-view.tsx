"use client";

import { CreateCollectionForm } from "@/components/collection-form";
import { Collections } from "@/components/collections";
import { showSidebarAtom } from "@/state";
import { useAtom } from "jotai";

export function CollectionsView() {
  const [showSidebar] = useAtom(showSidebarAtom);

  return (
    <>
      {showSidebar ? <Collections /> : null}
      <CreateCollectionForm />
    </>
  );
}
