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
import { createLink } from "../app/actions";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

const linkSchema = z.object({
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  url: z.string().url(),
  tags: z.array(z.string()),
});

const DEFAULT_FORM_VALUES = {
  url: "",
  tags: [],
};

export function CreateLinkForm({ parentId }: { parentId: number | null }) {
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
    // TODO: create tags as well...
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-row items-center justify-center"
      >
        <FormField
          control={form.control}
          name="url"
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
