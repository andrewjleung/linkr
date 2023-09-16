import { Collection, Prisma } from "@prisma/client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  MutableRefObject,
  useRef,
  useState,
  forwardRef,
  useEffect,
  useCallback,
  useContext,
  Dispatch,
  SetStateAction,
  KeyboardEventHandler,
} from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useKeyPress } from "@/hooks/use-keyboard";
import { useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { OptimisticCollection } from "@/hooks/use-optimistic-collections";

const renameFormSchema = z.object({
  name: z.string().nonempty(),
});

function RenameForm({
  name,
  onRenameSubmit,
  setIsEditing,
}: {
  name: string;
  onRenameSubmit: (newName: string) => Promise<void>;
  setIsEditing: (isEditing: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef?.current?.focus();
    inputRef?.current?.select();
  }, []);

  const form = useForm<z.infer<typeof renameFormSchema>>({
    resolver: zodResolver(renameFormSchema),
    defaultValues: {
      name,
    },
  });

  function onSubmit(values: z.infer<typeof renameFormSchema>) {
    onRenameSubmit(values.name);
  }

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event: React.KeyboardEvent
  ) => {
    if (event.code === "Enter") {
      onSubmit(form.getValues());
      return;
    }
  };

  function onBlur() {
    setIsEditing(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  ref={inputRef}
                  onKeyDown={onKeyDown}
                  // TODO: uncomment this when you figure out how to focus this
                  // input on mount.
                  // onBlur={onBlur}
                  className="px-4 py-2"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

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

function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-3 w-3 animate-pulse rounded-full bg-orange-400 blur-sm dark:bg-orange-500"></div>
      <div className="absolute h-2 w-2 animate-pulse rounded-full bg-orange-400 dark:bg-orange-500"></div>
    </div>
  );
}

export function Collection({
  optimisticCollection,
  editingCollection,
  setEditingCollection,
  unsafeRemoveCollection,
  renameCollection,
}: {
  optimisticCollection: OptimisticCollection;
  editingCollection: number | null;
  setEditingCollection: (editingCollection: number | null) => void;
  unsafeRemoveCollection: (id: number) => Promise<void>;
  renameCollection: (id: number, newName: string) => Promise<void>;
}) {
  if (optimisticCollection.type === "abstract") {
    return <AbstractCollection collection={optimisticCollection.collection} />;
  }

  const concreteCollectionProps: React.ComponentProps<
    typeof ConcreteCollection
  > = {
    collection: optimisticCollection.collection,
    isEditing: editingCollection === optimisticCollection.collection.id,
    setIsEditing: (isEditing: boolean) =>
      isEditing
        ? setEditingCollection(optimisticCollection.collection.id)
        : setEditingCollection(null),
    unsafeRemoveCollection,
    renameCollection,
  };

  return <ConcreteCollection {...concreteCollectionProps} />;
}

function AbstractCollection({
  collection,
}: {
  collection: Prisma.CollectionCreateInput;
}) {
  return (
    <Button
      className={cn(buttonVariants({ variant: "ghost" }), "relative w-full")}
    >
      <div className="w-full">{collection.name}</div>
      <LoadingIndicator />
    </Button>
  );
}

function ConcreteCollection({
  collection,
  isEditing,
  setIsEditing,
  unsafeRemoveCollection,
  renameCollection,
}: {
  collection: Collection;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  unsafeRemoveCollection: (id: number) => Promise<void>;
  renameCollection: (id: number, newName: string) => Promise<void>;
}) {
  const parentId = useParentCollection();
  const [deleteAlertIsOpen, setDeleteAlertIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    setDisplayName(collection.name);
  }, [setDisplayName, collection.name]);

  useKeyPress({ shiftKey: false, metaKey: false, code: "Escape" }, () => {
    setIsEditing(false);
  });

  const variant = parentId === collection.id ? "secondary" : "ghost";

  async function onClickDelete() {
    // TODO: Ask dialog to determine unsafe/safe deletion.

    setLoading(true);
    await unsafeRemoveCollection(collection.id);
    // TODO: Don't set loading to false so that it lasts as long as the
    // component still remains. This could cause a bug but seems okay for now.
    // Change this when you figure out how to do things optimistically.
  }

  function onRename() {
    setIsEditing(true);
  }

  async function onRenameSubmit(newName: string) {
    if (newName !== collection.name) {
      setIsEditing(false);
      setDisplayName(newName);
      setLoading(true);
      // TODO: Handle error case
      await renameCollection(collection.id, newName);
      setLoading(false);
      return;
    }

    setIsEditing(false);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          {isEditing ? (
            <RenameForm
              name={collection.name}
              onRenameSubmit={onRenameSubmit}
              setIsEditing={setIsEditing}
            />
          ) : (
            <Link
              href={`/collections/${collection.id}`}
              className={cn(
                buttonVariants({ variant: variant }),
                "relative w-full"
              )}
            >
              <div className="w-full">{displayName}</div>
              {loading ? <LoadingIndicator /> : null}
            </Link>
          )}
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
    </>
  );
}
