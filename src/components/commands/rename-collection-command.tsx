import { FolderEdit } from "lucide-react";
import { useGlobalDialog } from "@/hooks/use-global-dialog";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { CommandItem } from "../ui/command";

export function RenameCollectionCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalDialog>[1];
}) {
  const parentId = useParentCollection();
  const [, setFormOpen] = useGlobalDialog("rename-collection-form");

  if (parentId === null) return null;

  return (
    <CommandItem
      onSelect={() => {
        setOpen(false);
        setFormOpen(true);
      }}
      className="rounded-md"
    >
      <FolderEdit className="mr-2 h-4 w-4" />
      <span>Rename collection</span>
    </CommandItem>
  );
}
