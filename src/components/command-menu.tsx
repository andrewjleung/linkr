"use client";

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
import { useGlobalForm } from "@/hooks/use-global-form";
import { useKeyPress } from "@/hooks/use-keyboard";
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { openedFormAtom, showSidebarAtom } from "@/state";
import { useAtom } from "jotai";
import {
  Folder,
  FolderEdit,
  FolderMinus,
  FolderPlus,
  Home,
  Moon,
  Plus,
  SidebarClose,
  SidebarOpen,
  Sun,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

function ToggleSidebarCommand() {
  const [showSidebar, setShowSidebar] = useAtom(showSidebarAtom);

  return (
    <CommandItem
      onSelect={() => {
        setShowSidebar((showSidebar) => !showSidebar);
      }}
      className="rounded-lg"
    >
      {showSidebar ? (
        <SidebarClose className="mr-2 h-4 w-4" />
      ) : (
        <SidebarOpen className="mr-2 h-4 w-4" />
      )}
      <span>{showSidebar ? "Hide sidebar" : "Show sidebar"}</span>
    </CommandItem>
  );
}

function ToggleThemeCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalForm>[1];
}) {
  const { theme, setTheme } = useTheme();

  if (theme === null) {
    return null;
  }

  if (theme === "system") {
    return (
      <>
        <CommandItem
          onSelect={() => {
            setOpen(false);
            setTheme("light");
          }}
          className="rounded-md"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Turn on light mode</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setOpen(false);
            setTheme("dark");
          }}
          className="rounded-md"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Turn on dark mode</span>
        </CommandItem>
      </>
    );
  } else {
    return (
      <>
        <CommandItem
          onSelect={() => {
            setOpen(false);
            setTheme(theme === "light" ? "dark" : "light");
          }}
          className="rounded-md"
        >
          {theme === "light" ? (
            <Moon className="mr-2 h-4 w-4" />
          ) : (
            <Sun className="mr-2 h-4 w-4" />
          )}
          <span>Toggle theme</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setOpen(false);
            setTheme("system");
          }}
          className="rounded-md"
        >
          <SunMoon className="mr-2 h-4 w-4" />
          <span>Use system default for theme</span>
        </CommandItem>
      </>
    );
  }
}

function DeleteCollectionCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalForm>[1];
}) {
  const { optimisticCollections, unsafeRemoveCollection } =
    useContext(CollectionsContext);
  const parentId = useParentCollection();
  const collection = optimisticCollections.find(
    (c) => c.type === "concrete" && c.id === parentId
  );
  const [deleteAlertIsOpen, setDeleteAlertIsOpen] = useState(false);
  const router = useRouter();

  async function onClickDelete() {
    setOpen(false);

    if (parentId !== null) {
      await unsafeRemoveCollection(parentId);
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClickDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RenameCollectionCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalForm>[1];
}) {
  const parentId = useParentCollection();
  const [, setOpenedForm] = useAtom(openedFormAtom);

  if (parentId === null) return null;

  return (
    <CommandItem
      onSelect={() => {
        setOpen(false);
        setOpenedForm("rename-collection-form");
      }}
      className="rounded-md"
    >
      <FolderEdit className="mr-2 h-4 w-4" />
      <span>Rename collection</span>
    </CommandItem>
  );
}

const COMMAND_MENU_FORM = "command-menu";

export function CommandMenu() {
  const { optimisticCollections } = useContext(CollectionsContext);
  const router = useRouter();
  const [open, setOpen] = useGlobalForm(COMMAND_MENU_FORM);
  const [, setOpenedForm] = useAtom(openedFormAtom);

  useKeyPress(
    { shiftKey: false, metaKey: true, key: "k" },
    (event) => {
      event.preventDefault();
      setOpen(true);
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
              }}
              className="rounded-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New link</span>
              <CommandShortcut>Q</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenedForm("create-collection-form");
              }}
              className="rounded-md"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>New collection</span>
              <CommandShortcut>⇧Q</CommandShortcut>
            </CommandItem>
            <RenameCollectionCommand setOpen={setOpen} />
            <DeleteCollectionCommand setOpen={setOpen} />
            <ToggleThemeCommand setOpen={setOpen} />
          </CommandGroup>

          <CommandGroup heading="Collections">
            <CommandItem
              onSelect={() => {
                router.push("/");
                setOpen(false);
              }}
              className="rounded-md"
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
                  className="rounded-md"
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
