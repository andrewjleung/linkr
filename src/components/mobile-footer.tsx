"use client";

import { useAtom } from "jotai";
import { FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openedFormAtom } from "@/state";
import { MobileCollectionsPicker } from "./mobile-collections-picker";

export function MobileFooter() {
  const [, setOpenedForm] = useAtom(openedFormAtom);

  return (
    <div className="flex w-full flex-row gap-4">
      <MobileCollectionsPicker className="mx-auto flex-1 sm:mx-0 sm:hidden" />
      <Button
        variant="secondary"
        size="icon"
        className="left-8 flex-none sm:hidden"
        onClick={() => setOpenedForm("create-collection-form")}
      >
        <FolderPlus className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="right-8 flex-none sm:hidden"
        onClick={() => setOpenedForm("create-link-form")}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
