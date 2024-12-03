import type { useGlobalDialog } from "@/hooks/use-global-dialog";
import { Import } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommandItem } from "../ui/command";

export function ImportCommand({
  setOpen,
}: {
  setOpen: ReturnType<typeof useGlobalDialog>[1];
}) {
  const router = useRouter();

  return (
    <CommandItem
      onSelect={() => {
        setOpen(false);
        router.push("/import");
      }}
      className="rounded-lg"
    >
      <Import className="mr-2 h-4 w-4" />
      <span>Import bookmarks</span>
    </CommandItem>
  );
}
