"use client";

import { useContext, useRef } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { LinksContext } from "@/hooks/use-optimistic-links";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export function LinkSearcher({ className }: { className?: string }) {
  const { optimisticLinks } = useContext(LinksContext);
  const router = useRouter();

  return (
    <Command className={clsx(className)}>
      <CommandList>
        {optimisticLinks.map((l) => (
          <CommandItem
            key={`ink-searcher-${l.id}`}
            className="rounded-md"
            onSelect={() => router.replace(l.link.url)}
          >
            <span>{l.link.url}</span>
          </CommandItem>
        ))}
      </CommandList>
      <CommandInput placeholder="" />
    </Command>
  );
}
