import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useKeyPress } from "@/hooks/use-keyboard";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { Prisma } from "@prisma/client";

const collectionSchema = z.object({
  name: z.string().nonempty(),
});

const DEFAULT_FORM_VALUES = {
  name: "",
};

export function CreateCollectionForm({
  addCollection,
}: {
  addCollection: (collection: Prisma.CollectionCreateInput) => Promise<void>;
}) {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const parentId = useParentCollection();

  useKeyPress(
    { shiftKey: true, metaKey: false, code: "KeyQ" },
    (event) => {
      event.preventDefault();
      setFormIsOpen(true);
    },
    formIsOpen
  );

  return (
    <CreateCollectionFormInner
      key={`create-collection-form-${parentId}-${formIsOpen}`}
      open={formIsOpen}
      setOpen={setFormIsOpen}
      addCollection={addCollection}
    />
  );
}

function CreateCollectionFormInner({
  open,
  setOpen,
  addCollection,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  addCollection: (collection: Prisma.CollectionCreateInput) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof collectionSchema>>({
    resolver: zodResolver(collectionSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  async function onSubmit(values: z.infer<typeof collectionSchema>) {
    setLoading(true);

    // TODO: handle failure case
    await addCollection({
      name: values.name,
    })
      .then((collection) => {
        console.log(collection);
      })
      .catch((e) => {
        console.log(e);
      });

    setLoading(false);
    form.reset(DEFAULT_FORM_VALUES);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new collection</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-row items-center justify-center"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={loading}
              variant="outline"
              size="icon"
              type="submit"
              className="mb-auto ml-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
