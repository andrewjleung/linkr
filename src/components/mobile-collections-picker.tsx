import { Button } from "@/components//ui/button";
import {
  CollectionsContext,
  type ConcreteCollection,
} from "@/hooks/use-optimistic-collections";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { cn } from "@/lib/utils";
import { openedFormAtom } from "@/state";
import { useAtom } from "jotai";
import { Folder } from "lucide-react";
import { useContext } from "react";

export function MobileCollectionsPicker({ className }: { className?: string }) {
  const parentId = useParentCollection();
  const { optimisticCollections } = useContext(CollectionsContext);
  const [, setOpenedForm] = useAtom(openedFormAtom);

  const collection = optimisticCollections.find(
    (c) => c.type === "concrete" && c.id === parentId,
  ) as ConcreteCollection | undefined;

  return (
    <>
      <Button
        variant="outline"
        className={cn("justify-start", className)}
        onClick={() => setOpenedForm("command-menu")}
      >
        <Folder className="mr-2 h-4 w-4" />
        {collection?.collection.name || "Home"}
      </Button>
    </>
  );
}
