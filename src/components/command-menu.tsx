"use client";

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
import { useGlobalForm } from "@/hooks/use-global-form";
import { useKeyPress } from "@/hooks/use-keyboard";
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import { createClient } from "@/lib/supabase/client";
import { openedFormAtom, showSidebarAtom } from "@/state";
import { useAtom } from "jotai";
import {
	Folder,
	FolderPlus,
	Home,
	LogOut,
	Plus,
	SidebarClose,
	SidebarOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { DeleteCollectionCommand } from "./commands/delete-collection-command";
import { ImportCommand } from "./commands/import-command";
import { QuickAddCommand } from "./commands/quick-add-command";
import { RenameCollectionCommand } from "./commands/rename-collection-command";
import { ToggleThemeCommand } from "./commands/toggle-theme-command";

function ToggleSidebarCommand() {
	const [showSidebar, setShowSidebar] = useAtom(showSidebarAtom);

	return (
		<CommandItem
			onSelect={() => {
				setShowSidebar((showSidebar) => !showSidebar);
			}}
			className="rounded-lg"
		>
			{showSidebar ? (
				<SidebarClose className="mr-2 h-4 w-4" />
			) : (
				<SidebarOpen className="mr-2 h-4 w-4" />
			)}
			<span>{showSidebar ? "Hide sidebar" : "Show sidebar"}</span>
		</CommandItem>
	);
}

function LogoutCommand({
	setOpen,
}: {
	setOpen: ReturnType<typeof useGlobalForm>[1];
}) {
	const router = useRouter();

	return (
		<CommandItem
			onSelect={() => {
				setOpen(false);
				const supabase = createClient();
				supabase.auth.signOut();
				router.push("/login");
			}}
			className="rounded-lg"
		>
			<LogOut className="mr-2 h-4 w-4" />
			<span>Log out</span>
		</CommandItem>
	);
}

const COMMAND_MENU_FORM = "command-menu";

export function CommandMenu() {
	const { optimisticCollections } = useContext(CollectionsContext);
	const router = useRouter();
	const [open, setOpen] = useGlobalForm(COMMAND_MENU_FORM);
	const [, setOpenedForm] = useAtom(openedFormAtom);

	useKeyPress(
		{ shiftKey: false, metaKey: true, key: "k" },
		(event) => {
			event.preventDefault();
			setOpen(true);
		},
		open,
	);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<Command className="rounded-lg border-none shadow-md">
				<CommandInput placeholder="Enter a command or search collections..." />
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
								</CommandItem>
							))}
					</CommandGroup>

					<CommandGroup heading="Commands">
						<QuickAddCommand setOpen={setOpen} />
						<CommandItem
							onSelect={() => {
								setOpenedForm("create-link-form");
							}}
							className="rounded-md"
						>
							<Plus className="mr-2 h-4 w-4" />
							<span>New link</span>
							<CommandShortcut>Q</CommandShortcut>
						</CommandItem>
						<CommandItem
							onSelect={() => {
								setOpenedForm("create-collection-form");
							}}
							className="rounded-md"
						>
							<FolderPlus className="mr-2 h-4 w-4" />
							<span>New collection</span>
							<CommandShortcut>⇧Q</CommandShortcut>
						</CommandItem>
						<RenameCollectionCommand setOpen={setOpen} />
						<DeleteCollectionCommand setOpen={setOpen} />
						<ImportCommand setOpen={setOpen} />
						<LogoutCommand setOpen={setOpen} />
					</CommandGroup>
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
