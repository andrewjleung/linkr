"use client";

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

const renameFormSchema = z.object({
  name: z.string().nonempty(),
});

type CollectionProps = HomeCollection | NonHomeCollection;

type HomeCollection = {
  type: "home";
};

type NonHomeCollection = {
  type: "non-home";
  collection: Collection;
};

function RenameForm({ name }: { name: string }) {
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

    console.log(values);
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
                <Input {...field} ref={inputRef} className="px-4 py-2" />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export default function Collection({
  collection,
  isSelected,
}: {
  collection: CollectionProps;
  isSelected: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { addMapping, removeMapping } = useContext(KeyboardContext);

  const [id, name] =
    collection.type === "home"
      ? [null, "Home"]
      : [collection.collection.id, collection.collection.name];

  const variant = isSelected ? "secondary" : "ghost";

  function onClickRename() {
    setIsEditing(true);
    addMapping(KEYPRESSES.escape, () => {
      setIsEditing(false);
      removeMapping(KEYPRESSES.escape);
    });
  }

  async function onClickDelete() {
    if (id === null) {
      return;
    }

    // TODO: Ask dialog to determine unsafe/safe deletion.
    unsafeDeleteCollection(id);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {isEditing ? (
          <RenameForm name={name} />
        ) : (
          <Link
            href={`/collections/${id === null ? "" : id}`}
            className={cn(buttonVariants({ variant: variant }), "w-full")}
          >
            <div className="w-full">{name}</div>
          </Link>
        )}
      </ContextMenuTrigger>
      {collection.type === "home" ? null : (
        <ContextMenuContent className="w-48">
          <ContextMenuItem inset onClick={onClickRename}>
            Rename
          </ContextMenuItem>
          <ContextMenuItem inset onClick={onClickDelete}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
