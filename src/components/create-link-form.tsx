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

const linkSchema = z.object({
  title: z.optional(z.string().trim()),
  description: z.optional(z.string()),
  url: z.string().trim().url(),
  tags: z.array(z.string().trim()),
});

const DEFAULT_FORM_VALUES = {
  url: "",
  tags: [],
};

export function CreateLinkForm({
  parentId,
  open,
  setOpen,
}: {
  parentId: number | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  async function onSubmit(values: z.infer<typeof linkSchema>) {
    setLoading(true);

    // TODO: handle failure case
    await createLink({
      title: values.title,
      description: values.description,
      url: values.url,
      parentId: parentId,
    })
      .then((link) => {
        console.log(link);
      })
      .catch((e) => {
        console.log(e);
      });

    setLoading(false);
    form.reset(DEFAULT_FORM_VALUES);
    setOpen(false);
    // TODO: create tags as well...
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Link</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          </form>
        </Form>
        <DialogFooter>
          <Button
            disabled={loading}
            size="icon"
            className="mb-auto ml-4"
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
