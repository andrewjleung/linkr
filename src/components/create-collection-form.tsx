"use client";

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
import { createCollection } from "../app/actions";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

const collectionSchema = z.object({
  name: z.string().nonempty(),
});

const DEFAULT_FORM_VALUES = {
  name: "",
};

export function CreateCollectionForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof collectionSchema>>({
    resolver: zodResolver(collectionSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  async function onSubmit(values: z.infer<typeof collectionSchema>) {
    setLoading(true);

    // TODO: handle failure case
    await createCollection({
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
  }

  return (
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
        {/* TODO: this button isn't the right width for some reason... */}
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
  );
}
