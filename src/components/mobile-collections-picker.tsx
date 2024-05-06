import { Button } from "@/components//ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";
import { useGlobalDialog } from "@/hooks/use-global-dialog";
import {
	CollectionsContext,
	type ConcreteCollection,
} from "@/hooks/use-optimistic-collections";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { cn } from "@/lib/utils";
import { Check, Folder, Home, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";

export function MobileCollectionsPicker({ className }: { className?: string }) {
	const parentId = useParentCollection();
	const { optimisticCollections } = useContext(CollectionsContext);
	const [open, setOpen] = useGlobalDialog("mobile-collections-picker");
	const router = useRouter();

	const collection = optimisticCollections.find(
		(c) => c.type === "concrete" && c.id === parentId,
	) as ConcreteCollection | undefined;

	return (
		<>
			<Button
				variant="outline"
				className={cn("justify-start", className)}
				onClick={() => setOpen(true)}
			>
				<Search className="mr-2 h-4 w-4" />
				{collection?.collection.name || "Home"}
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<Command className="rounded-lg border-none shadow-md">
					<CommandInput placeholder="Search collections..." />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>

						<CommandGroup heading="Collections">
							<CommandItem
								onSelect={() => {
									router.push("/collections/home");
									setOpen(false);
								}}
								className="rounded-md"
							>
								<Home className="mr-2 h-4 w-4" />
								<span>Home</span>
								<CommandShortcut>
									{parentId === null ? (
										<Check className="mr-2 h-4 w-4" />
									) : null}
								</CommandShortcut>
							</CommandItem>
							{optimisticCollections
								.filter((c) => c.type === "concrete")
								.sort((c1, c2) => c1.collection.order - c2.collection.order)
								.map((c) => (
									<CommandItem
										key={`collection-command-${c.id}`}
										onSelect={() => {
											router.push(`/collections/${c.id}`);
											setOpen(false);
										}}
										className="rounded-md"
									>
										<Folder className="mr-2 h-4 w-4" />
										<span>{c.collection.name}</span>
										<CommandShortcut>
											{parentId === c.id ? (
												<Check className="mr-2 h-4 w-4" />
											) : null}
										</CommandShortcut>
									</CommandItem>
								))}
						</CommandGroup>
					</CommandList>
				</Command>
			</CommandDialog>
		</>
	);
}
