"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openedFormAtom } from "@/state";
import { useAtom } from "jotai";

export function CommandMenuButton({ className }: { className?: string }) {
  const [, setOpenedForm] = useAtom(openedFormAtom);

  return (
    <Button
      variant="outline"
      className={cn("relative w-40 px-0", className)}
      onClick={() => setOpenedForm("command-menu")}
    >
      <span className="absolute left-3 top-1.75">Commands</span>
      <div className="absolute top-1.75 right-1.5 hidden gap-1 sm:flex">
        <kbd className="bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none [&amp;_svg:not([class*='size-'])]:size-3">
          ⌘
        </kbd>
        <kbd className="bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none [&amp;_svg:not([class*='size-'])]:size-3 aspect-square">
          K
        </kbd>
      </div>
    </Button>
  );
}
