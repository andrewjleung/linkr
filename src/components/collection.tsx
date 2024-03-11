import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useParentCollection } from "@/hooks/use-parent-collection";
import {
  CollectionsContext,
  OptimisticCollection,
} from "@/hooks/use-optimistic-collections";
import LoadingIndicator from "@/components/loading-indicator";
import { RenameCollectionForm } from "@/components/collection-form";
import { Collection, CollectionInsert } from "@/database/types";

export function HomeCollection() {
  const parentId = useParentCollection();
  const variant = parentId === null ? "secondary" : "ghost";

  return (
    <Link
      href="/collections"
      className={cn(buttonVariants({ variant: variant }), "w-full")}
    >
      <div className="w-full">Home</div>
    </Link>
  );
}

export function CollectionComponent({
  optimisticCollection,
}: {
  optimisticCollection: OptimisticCollection;
}) {
  if (optimisticCollection.type === "abstract") {
    return <AbstractCollection collection={optimisticCollection.collection} />;
  }

  return <ConcreteCollection collection={optimisticCollection.collection} />;
}

function AbstractCollection({
  collection,
}: {
  collection: Omit<CollectionInsert, "parentCollectionId">;
}) {
  return (
    <Button variant="ghost" className="w-full">
      <div className="mr-auto flex-row">
        {collection.name}
        {/*<span className="mr-auto dark:text-neutral-700">
          {collection.order || "no order"}
        </span>*/}
      </div>
    </Button>
  );
}

function ConcreteCollection({ collection }: { collection: Collection }) {
  const { unsafeRemoveCollection } = useContext(CollectionsContext);
  const parentId = useParentCollection();
  const [deleteAlertIsOpen, setDeleteAlertIsOpen] = useState(false);
  const [renameFormOpen, setRenameFormOpen] = useState(false);

  const variant = parentId === collection.id ? "secondary" : "ghost";

  async function onClickDelete() {
    // TODO: Ask dialog to determine unsafe/safe deletion.

    await unsafeRemoveCollection(collection.id);
  }

  function onRename() {
    setRenameFormOpen(true);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Link
            href={`/collections/${collection.id}`}
            className={cn(
              buttonVariants({ variant: variant }),
              "relative w-full"
            )}
          >
            <div className="w-full">{collection.name}</div>
            {/* <span className="mr-auto text-xs dark:text-neutral-700">
              {collection.order || "0"}
            </span> */}
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem inset onClick={onRename}>
            Rename
          </ContextMenuItem>
          <ContextMenuItem inset onClick={() => setDeleteAlertIsOpen(true)}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <AlertDialog open={deleteAlertIsOpen} onOpenChange={setDeleteAlertIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete {collection.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this collection will delete all nested collections and
              links. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClickDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <RenameCollectionForm />
    </>
  );
}
