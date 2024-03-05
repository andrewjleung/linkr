"use client";

import { CreateCollectionForm } from "@/components/collection-form";
import { Collections } from "@/components/collections";
import { CommandMenu } from "./command-menu";
import { useAtom } from "jotai";
import { showSidebarAtom } from "@/state";

export function CollectionsView() {
  const [showSidebar] = useAtom(showSidebarAtom);

  return (
    <>
      {showSidebar ? <Collections /> : null}
      <CreateCollectionForm />
      <CommandMenu />
    </>
  );
}
