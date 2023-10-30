import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createLink } from "../app/actions";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { Link, Prisma } from "@prisma/client";
import { useKeyPress } from "@/hooks/use-keyboard";
import { Textarea } from "@/components/ui/textarea";

function isUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch (_) {
    return false;
  }
}

const linkSchema = z.object({
  title: z.optional(z.string().trim()),
  description: z.optional(z.string()),
  url: z
    .string()
    .trim()
    .transform((val) => {
      if (isUrl(val)) {
        return val;
      }

      const valWithSchemePrefix = `https://${val}`;

      if (isUrl(valWithSchemePrefix)) {
        return valWithSchemePrefix;
      }

      return val;
    })
    .pipe(z.string().url()),
  tags: z.array(z.string().trim()),
});

const DEFAULT_FORM_VALUES = {
  url: "",
  tags: [],
};

export function CreateLinkForm({
  addLink,
}: {
  addLink: (link: Prisma.LinkCreateInput) => Promise<void>;
}) {
  const [createLinkFormIsOpen, setCreateLinkFormIsOpen] = useState(false);
  const parentId = useParentCollection();

  useKeyPress(
    { shiftKey: false, metaKey: false, code: "KeyQ" },
    (event) => {
      event.preventDefault();
      setCreateLinkFormIsOpen(true);
    },
    createLinkFormIsOpen
  );

  return (
    <CreateLinkFormInner
      key={`create-link-form-${parentId}-${createLinkFormIsOpen}`}
      open={createLinkFormIsOpen}
      setOpen={setCreateLinkFormIsOpen}
      addLink={addLink}
    />
  );
}

function CreateLinkFormInner({
  open,
  setOpen,
  addLink,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  addLink: (link: Prisma.LinkCreateInput) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const parentId = useParentCollection();

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  async function onSubmit(values: z.infer<typeof linkSchema>) {
    setLoading(true);

    if (parentId === null) {
      await addLink({
        title: values.title || null,
        description: values.description || null,
        url: values.url,
      });
    } else {
      // TODO: handle failure case
      await addLink({
        title: values.title || null,
        description: values.description || null,
        url: values.url,
        parent: { connect: { id: parentId } },
      });
    }

    setLoading(false);
    form.reset(DEFAULT_FORM_VALUES);
    setOpen(false);
    // TODO: create tags as well...
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new link</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                disabled={loading}
                size="icon"
                className="mt-2"
                type="submit"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
