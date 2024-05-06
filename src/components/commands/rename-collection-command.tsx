import type { useGlobalDialog } from "@/hooks/use-global-dialog";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { openedFormAtom } from "@/state";
import { useAtom } from "jotai";
import { FolderEdit } from "lucide-react";
import { CommandItem } from "../ui/command";

export function RenameCollectionCommand({
	setOpen,
}: {
	setOpen: ReturnType<typeof useGlobalDialog>[1];
}) {
	const parentId = useParentCollection();
	const [, setOpenedForm] = useAtom(openedFormAtom);

	if (parentId === null) return null;

	return (
		<CommandItem
			onSelect={() => {
				setOpen(false);
				setOpenedForm("rename-collection-form");
			}}
			className="rounded-md"
		>
			<FolderEdit className="mr-2 h-4 w-4" />
			<span>Rename collection</span>
		</CommandItem>
	);
}
