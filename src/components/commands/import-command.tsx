import { Import } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommandItem } from "../ui/command";

export function ImportCommand() {
	const router = useRouter();

	return (
		<CommandItem onSelect={() => router.push("/import")} className="rounded-lg">
			<Import className="mr-2 h-4 w-4" />
			<span>Import bookmarks</span>
		</CommandItem>
	);
}
