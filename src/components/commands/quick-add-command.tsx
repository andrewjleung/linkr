import { useClipboard } from "@/hooks/use-clipboard";
import type { useGlobalDialog } from "@/hooks/use-global-dialog";
import { LinksContext } from "@/hooks/use-optimistic-links";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { PlusCircle } from "lucide-react";
import { useContext } from "react";
import { toast } from "sonner";
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
	setOpen: ReturnType<typeof useGlobalDialog>[1];
}) {
	const clipboard = useClipboard();
	const parentId = useParentCollection();
	const { addOptimisticLink } = useContext(LinksContext);

	if (clipboard === undefined) return null;

	if (!isUrl(clipboard)) return null;

	return (
		<CommandItem
			onSelect={async () => {
				setOpen(false);
				await addOptimisticLink({
					parentCollectionId: parentId,
					url: clipboard,
					title: null,
					description: null,
				});

				toast.success("Link has been created.", { description: clipboard });
				navigator.clipboard.writeText("");
			}}
			className="rounded-md"
		>
			<PlusCircle className="mr-2 h-4 w-4" />
			<span>Add link from clipboard: {clipboard}</span>
		</CommandItem>
	);
}
