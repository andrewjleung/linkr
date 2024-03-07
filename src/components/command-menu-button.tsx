"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAtom } from "jotai";
import { openedFormAtom } from "@/state";
import clsx from "clsx";

export function CommandMenuButton({ className }: { className?: string }) {
  const [, setOpenedForm] = useAtom(openedFormAtom);

  return (
    <Button
      variant="outline"
      className={clsx("pr-2", className)}
      onClick={() => setOpenedForm("command-menu")}
    >
      Commands
      <Badge
        variant="secondary"
        className="ml-2 scale-90 rounded-md px-2 text-xs"
      >
        ⌘ K
      </Badge>
    </Button>
  );
}
