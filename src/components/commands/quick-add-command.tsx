import { useClipboard } from "@/hooks/use-clipboard";
import type { useGlobalForm } from "@/hooks/use-global-form";
import { LinksContext } from "@/hooks/use-optimistic-links";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { PlusCircle } from "lucide-react";
import { useContext } from "react";
import { CommandItem } from "../ui/command";

function isUrl(s: string): boolean {
	try {
		new URL(s);
		return true;
	} catch (_) {
		return false;
	}
}

export function QuickAddCommand({
	setOpen,
}: {
	setOpen: ReturnType<typeof useGlobalForm>[1];
}) {
	const clipboard = useClipboard();
	const parentId = useParentCollection();
	const { addOptimisticLink } = useContext(LinksContext);

	if (clipboard === undefined) return null;

	if (!isUrl(clipboard)) return null;

	return (
		<CommandItem
			onSelect={() => {
				setOpen(false);
				addOptimisticLink({
					parentCollectionId: parentId,
					url: clipboard,
					title: null,
					description: null,
				});
				navigator.clipboard.writeText("");
			}}
			className="rounded-md"
		>
			<PlusCircle className="mr-2 h-4 w-4" />
			<span>Add link from clipboard: {clipboard}</span>
		</CommandItem>
	);
}