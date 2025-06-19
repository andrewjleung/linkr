"use client";

import { useAtom } from "jotai";
import { CreateCollectionForm } from "@/components/collection-form";
import { Collections } from "@/components/collections";
import { showSidebarAtom } from "@/state";

export function CollectionsView() {
  const [showSidebar] = useAtom(showSidebarAtom);

  return (
    <>
      {showSidebar ? <Collections /> : null}
      <CreateCollectionForm />
    </>
  );
}
