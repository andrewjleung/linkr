import { FolderMinus } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
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
import { CommandItem } from "@/components/ui/command";
import type { useGlobalDialog } from "@/hooks/use-global-dialog";
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import { useParentCollection } from "@/hooks/use-parent-collection";

export function DeleteCollectionCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalDialog>[1];
}) {
  const { optimisticCollections, unsafeRemoveCollection } =
    useContext(CollectionsContext);
  const parentId = useParentCollection();
  const collection = optimisticCollections.find(
    (c) => c.type === "concrete" && c.id === parentId,
  );
  const [deleteAlertIsOpen, setDeleteAlertIsOpen] = useState(false);

  async function onClickDelete() {
    setOpen(false);

    if (parentId !== null) {
      await unsafeRemoveCollection(parentId);

      toast.success("Collection has been deleted.");
    }
  }

  if (parentId === null) {
    return null;
  }

  return (
    <>
      <CommandItem
        onSelect={() => {
          setDeleteAlertIsOpen(true);
        }}
        className="rounded-md"
      >
        <FolderMinus className="mr-2 h-4 w-4" />
        <span>Delete collection</span>
      </CommandItem>
      <AlertDialog open={deleteAlertIsOpen} onOpenChange={setDeleteAlertIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete {collection?.collection.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this collection will delete all nested collections and
              links. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
