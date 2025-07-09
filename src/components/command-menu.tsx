"use client";

import { useAtom } from "jotai";
import {
  Folder,
  FolderPlus,
  Home,
  LogIn,
  LogOut,
  Plus,
  SidebarClose,
  SidebarOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { toast } from "sonner";
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
import { useDemo } from "@/hooks/use-demo";
import { useGlobalDialog } from "@/hooks/use-global-dialog";
import { useKeyPress } from "@/hooks/use-keyboard";
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import { openedFormAtom, showSidebarAtom } from "@/state";
import { createClient } from "@/utils/supabase/client";
import { DeleteCollectionCommand } from "./commands/delete-collection-command";
import { ImportCommand } from "./commands/import-command";
import { QuickAddCommand } from "./commands/quick-add-command";
import { RenameCollectionCommand } from "./commands/rename-collection-command";

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

function LogoutCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalDialog>[1];
}) {
  const router = useRouter();

  return (
    <CommandItem
      onSelect={async () => {
        setOpen(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        toast.info("You've been logged out.");
      }}
      className="rounded-lg"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </CommandItem>
  );
}

function LoginCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalDialog>[1];
}) {
  const router = useRouter();

  return (
    <CommandItem
      onSelect={() => {
        setOpen(false);
        router.push("/login");
      }}
      className="rounded-lg"
    >
      <LogIn className="mr-2 h-4 w-4" />
      <span>Login</span>
    </CommandItem>
  );
}

export function CommandMenu() {
  const { optimisticCollections } = useContext(CollectionsContext);
  const router = useRouter();
  const [open, setOpen] = useGlobalDialog("command-menu");
  const [, setOpenedForm] = useAtom(openedFormAtom);
  const { isDemo, demoLink } = useDemo();

  useKeyPress(
    { shiftKey: false, metaKey: true, key: "k" },
    (event) => {
      event.preventDefault();
      setOpen(true);
    },
    open,
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border-none shadow-md h-64 sm:h-auto">
        <CommandInput placeholder="Enter a command or search collections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Commands">
            {/* <QuickAddCommand setOpen={setOpen} /> */}
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
            {isDemo ? null : <ImportCommand setOpen={setOpen} />}
            {isDemo ? null : <LogoutCommand setOpen={setOpen} />}
            {isDemo ? <LoginCommand setOpen={setOpen} /> : null}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Collections">
            <CommandItem
              onSelect={() => {
                router.push(demoLink("/collections/home"));
                setOpen(false);
              }}
              className="rounded-md"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            {optimisticCollections
              .filter((c) => c.type === "concrete")
              .sort((a, b) =>
                (a.collection.name || "").localeCompare(
                  b.collection.name || "",
                ),
              )
              .map((c) => (
                <CommandItem
                  key={`collection-command-${c.id}`}
                  onSelect={() => {
                    router.push(demoLink(`/collections/${c.id}`));
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
