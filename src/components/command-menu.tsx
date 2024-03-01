import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useKeyPress } from "@/hooks/use-keyboard";
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import { openedFormAtom } from "@/state";
import { useAtom } from "jotai";
import { Folder, FolderPlus, Home, Plus } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useContext, useState } from "react";

export function CommandMenu() {
  const { optimisticCollections } = useContext(CollectionsContext);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [, setOpenedForm] = useAtom(openedFormAtom);

  useKeyPress(
    { shiftKey: false, metaKey: true, key: "k" },
    (event) => {
      event.preventDefault();
      setOpen((open) => !open);
    },
    open
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border-none shadow-md">
        <CommandInput placeholder="Enter a command or search collections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Commands">
            <CommandItem
              onSelect={() => {
                setOpenedForm("create-link-form");
                setOpen(false);
              }}
              className="rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create a link</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenedForm("create-collection-form");
                setOpen(false);
              }}
              className="rounded-lg"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>Create a collection</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Collections">
            <CommandItem
              onSelect={() => {
                router.push("/");
                setOpen(false);
              }}
              className="rounded-lg"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            {optimisticCollections
              .filter((c) => c.type === "concrete")
              .sort((c1, c2) => c1.collection.order - c2.collection.order)
              .map((c) => (
                <CommandItem
                  key={`collection-command-${c.id}`}
                  onSelect={() => {
                    router.push(`/collections/${c.id}`);
                    setOpen(false);
                  }}
                  className="rounded-lg"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  <span>{c.collection.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
