import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormReturn, useForm } from "react-hook-form";
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
import { createLink, editLink } from "@/app/actions";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { useKeyPress } from "@/hooks/use-keyboard";
import { Textarea } from "@/components/ui/textarea";
import { OptimisticLinks } from "@/hooks/use-optimistic-links";
import { Link } from "@/database/types";

function isUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch (_) {
    return false;
  }
}

const urlSchema = z
  .string()
  .trim()
  .transform((val) => {
    if (isUrl(val)) {
      return val;
    }

    const valWithHTTPSScheme = `https://${val}`;

    if (isUrl(valWithHTTPSScheme)) {
      return valWithHTTPSScheme;
    }
  })
  .pipe(z.string().url());

const linkSchema = z.object({
  title: z.optional(z.string().trim()),
  description: z.optional(z.string()),
  url: urlSchema,
  // tags: z.array(z.string().trim()),
});

const DEFAULT_FORM_VALUES = {
  title: "",
  url: "",
  description: "",
};

export function EditLinkForm({
  link,
  editOptimisticLink,
  open,
  setOpen,
}: {
  link: Link;
  editOptimisticLink: OptimisticLinks["editOptimisticLink"];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link.title || "",
      url: link.url,
      description: link.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof linkSchema>) {
    setLoading(true);
    setOpen(false);

    await editOptimisticLink(link.id, {
      title: values.title || null,
      description: values.description || null,
      url: values.url,
    });

    setLoading(false);
  }

  return (
    <LinkFormInner
      key={`edit-link-form-${open}-${link.id}`}
      title="Edit link"
      form={form}
      loading={loading}
      open={open}
      setOpen={setOpen}
      onSubmit={onSubmit}
    />
  );
}

export function CreateLinkForm({
  addOptimisticLink,
}: {
  addOptimisticLink: OptimisticLinks["addOptimisticLink"];
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const parentId = useParentCollection();

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const onSubmit = async (values: z.infer<typeof linkSchema>) => {
    setLoading(true);
    form.reset(DEFAULT_FORM_VALUES);
    setOpen(false);

    await addOptimisticLink({
      title: values.title || null,
      description: values.description || null,
      url: values.url,
      parentCollectionId: parentId,
    });

    setLoading(false);
    // TODO: create tags as well...
  };

  useKeyPress(
    { shiftKey: false, metaKey: false, code: "KeyQ" },
    (event) => {
      event.preventDefault();
      setOpen(true);
    },
    open
  );

  return (
    <LinkFormInner
      key={`create-link-form-${open}-${parentId}`}
      title="Add a new link"
      form={form}
      loading={loading}
      open={open}
      setOpen={setOpen}
      onSubmit={onSubmit}
    />
  );
}

function LinkFormInner({
  title,
  form,
  loading,
  open,
  setOpen,
  onSubmit,
}: {
  title: string;
  form: UseFormReturn<z.infer<typeof linkSchema>>;
  loading: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (values: z.infer<typeof linkSchema>) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
