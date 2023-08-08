import { Collection } from "@prisma/client";
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
import { safeDeleteCollection, unsafeDeleteCollection } from "@/app/actions";
import { KEYPRESSES, KeyboardContext } from "@/hooks/use-keyboard";
import { useParams } from "next/navigation";

const renameFormSchema = z.object({
  name: z.string().nonempty(),
});

type CollectionProps = {
  collection: Collection;
  isEditing: boolean;
  onRename: () => void;
  onRenameSubmit: (newName: string) => Promise<void>;
};

function RenameForm({
  name,
  onRenameSubmit,
}: {
  name: string;
  onRenameSubmit: (newName: string) => Promise<void>;
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
    if (values.name === name) {
      return;
    }

    onRenameSubmit(values.name);
  }

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event: React.KeyboardEvent
  ) => {
    console.log(event);
    if (event.code === "Enter") {
      onSubmit(form.getValues());
    }
  };

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
  const { id } = useParams();
  const parentId = Number(id) || null;
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

export function Collection({
  collection,
  isEditing,
  onRename,
  onRenameSubmit,
}: CollectionProps) {
  const { id } = useParams();
  const parentId = Number(id) || null;

  const variant = parentId === collection.id ? "secondary" : "ghost";

  async function onClickDelete() {
    if (id === null) {
      return;
    }

    // TODO: Ask dialog to determine unsafe/safe deletion.
    await unsafeDeleteCollection(collection.id);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {isEditing ? (
          <RenameForm name={collection.name} onRenameSubmit={onRenameSubmit} />
        ) : (
          <Link
            href={`/collections/${collection.id}`}
            className={cn(buttonVariants({ variant: variant }), "w-full")}
          >
            <div className="w-full">{collection.name}</div>
          </Link>
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem inset onClick={onRename}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem inset onClick={onClickDelete}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
