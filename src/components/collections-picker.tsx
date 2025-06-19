"use client";

import { Check, ChevronsUpDown, Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDemo } from "@/hooks/use-demo";
import {
  CollectionsContext,
  type ConcreteCollection,
} from "@/hooks/use-optimistic-collections";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { cn } from "@/lib/utils";

export function CollectionsPicker({ className }: { className?: string }) {
  const parentId = useParentCollection();
  const { optimisticCollections } = useContext(CollectionsContext);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { demoLink } = useDemo();

  const concreteCollections = optimisticCollections
    .filter((c) => c.type === "concrete")
    .sort(
      (c1, c2) => c1.collection.order - c2.collection.order,
    ) as ConcreteCollection[];

  const buttonText = pathname.startsWith("/import")
    ? "Import"
    : parentId === null
      ? "Home"
      : concreteCollections.find((c) => c.id === parentId)?.collection.name;

  useEffect(() => {
    if (parentId !== null) {
      router.prefetch(demoLink("/collections/home"));
    }

    for (const c of concreteCollections) {
      if (c.id === parentId) {
        continue;
      }

      router.prefetch(`/collections/${c.id}`);
    }
  }, [concreteCollections, demoLink, router, parentId]);

  return (
    <div className={cn(className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-expanded={open}
            className="w-[200px] justify-between flex flex-row "
            aria-label={`Open collections picker, current collection is ${buttonText}`}
          >
            <span>{buttonText}</span>
            <div className="ml-auto">
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search collections..." />
            <CommandEmpty>No collection found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key={"collection-picker-home"}
                className="rounded-md"
                onSelect={() => {
                  router.push(demoLink("/collections/home"));
                  setOpen(false);
                }}
              >
                <Home
                  className={cn(
                    "mr-2 h-4 w-4",
                    parentId === null ? "opacity-100" : "opacity-0",
                  )}
                />
                Home
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              {concreteCollections
                .sort((a, b) =>
                  (a.collection.name || "").localeCompare(
                    b.collection.name || "",
                  ),
                )
                .map((c) => (
                  <CommandItem
                    key={`collection-picker-${c.id}`}
                    className="rounded-md"
                    onSelect={() => {
                      router.push(demoLink(`/collections/${c.id}`));
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        parentId === c.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {c.collection.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
