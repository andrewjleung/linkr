"use client";

import { insertImports, parseRaindropImport } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Collection } from "@/database/types";
import type { ConcreteCollection } from "@/hooks/use-optimistic-collections";
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import { cn } from "@/lib/utils";
import type { ImportedLink } from "@/services/import-service";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	ChevronsUpDown,
	Info,
	SquareArrowOutUpRight,
} from "lucide-react";
import { useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";
import { z } from "zod";

const fileSchema = z.instanceof(File, { message: "Required" });

const raindropImportFormSchema = z.object({
	file: fileSchema.refine(
		(file) => file.size > 0,
		"File size must be greater than 0",
	),
});

function ImportedCollections({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col">{children}</div>;
}

function ImportedCollection({
	name,
	children,
	selected,
	setCollectionSelected,
}: {
	name: string;
	children: React.ReactNode;
	selected: boolean;
	setCollectionSelected: (name: string, selected: boolean) => void;
}) {
	function onChange(c: CheckedState): void {
		const value = c.valueOf();

		if (typeof value === "string") {
			setCollectionSelected(name, false);
			return;
		}

		setCollectionSelected(name, value);
	}

	const id = `selectable-imported-collection-${name}`;

	return (
		<div>
			<div className="flex flex-row items-center gap-3 hover:bg-neutral-200 dark:hover:bg-neutral-800 px-3 py-2 rounded-lg">
				<Checkbox id={id} checked={selected} onCheckedChange={onChange} />
				<label htmlFor={id}>{name}</label>
			</div>
			{children}
		</div>
	);
}

function ImportedLinks({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col">{children}</div>;
}

function ImportedLinkComponent({
	link,
	selected,
	setLinkSelected,
}: {
	link: SelectableImportedLink;
	selected: boolean;
	setLinkSelected: (linkId: string, selected: boolean) => void;
}) {
	function onChange(c: CheckedState): void {
		const value = c.valueOf();

		if (typeof value === "string") {
			setLinkSelected(link.id, false);
			return;
		}

		setLinkSelected(link.id, value);
	}

	const id = `selectable-imported-link-${link.id}`;

	return (
		<span className="flex flex-row items-center gap-3 ml-4 hover:bg-neutral-200 dark:hover:bg-neutral-800 px-3 py-2 rounded-lg">
			<Checkbox id={id} checked={selected} onCheckedChange={onChange} />
			<Tooltip>
				<TooltipTrigger asChild>
					<label htmlFor={id} className="line-clamp-1 text-sm">
						{link.link.url}
					</label>
				</TooltipTrigger>
				<TooltipContent>{link.link.url}</TooltipContent>
			</Tooltip>
			<a
				href={link.link.url}
				className="ml-auto dark:hover:text-blue-600 transition-all ease-out hover:text-blue-500 dark:text-neutral-700 text-neutral-500"
				target="_blank"
				rel="noreferrer"
			>
				<SquareArrowOutUpRight className="w-4 h-4" />
			</a>
		</span>
	);
}

type SelectableImportedLink = {
	id: string;
	link: ImportedLink;
};

type PageState = "selection" | "editing";

function ImportLinks({
	setLinks,
}: {
	setLinks: React.Dispatch<
		React.SetStateAction<SelectableImportedLink[] | null>
	>;
}) {
	const form = useForm<z.infer<typeof raindropImportFormSchema>>({
		resolver: zodResolver(raindropImportFormSchema),
	});

	async function onSubmit(values: z.infer<typeof raindropImportFormSchema>) {
		const ab = await values.file.arrayBuffer();
		const serialized = new TextDecoder().decode(ab);
		const importedLinks = await parseRaindropImport(serialized);
		setLinks(
			importedLinks.map((il) => ({
				// TODO: Using a random id here for the id may not be a great idea...
				id: crypto.randomUUID(),
				link: il,
			})),
		);
	}

	return (
		<AnimatePresence>
			<Form {...form}>
				<motion.form
					key="import-links-form"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onSubmit={form.handleSubmit(onSubmit)}
					className="mx-auto mt-12 flex flex-col w-96"
				>
					<FormField
						control={form.control}
						name="file"
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel className="flex flex-row items-center">
									Upload a backup CSV from Raindrop
									<a
										href="https://help.raindrop.io/backups#downloading-a-backup"
										className="ml-2"
										target="_blank"
										rel="noreferrer"
									>
										<Info className="h-4 w-4" />
									</a>
								</FormLabel>
								<FormControl>
									<Input
										{...fieldProps}
										type="file"
										onChange={(event) => onChange(event.target.files?.[0])}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="mt-4">
						Import
					</Button>
				</motion.form>
			</Form>
		</AnimatePresence>
	);
}

function SelectLinks({
	links,
	setLinks,
	selectedLinks,
	setSelectedLinks,
	setPageState,
}: {
	links: SelectableImportedLink[];
	setLinks: React.Dispatch<
		React.SetStateAction<SelectableImportedLink[] | null>
	>;
	selectedLinks: string[];
	setSelectedLinks: React.Dispatch<React.SetStateAction<string[]>>;
	setPageState: React.Dispatch<React.SetStateAction<PageState>>;
}) {
	const linksByCollection = Object.groupBy(links, (il) => il.link.parent);

	function onSubmitSelection() {
		setPageState("editing");
	}

	function onSelectAll(c: CheckedState): void {
		const value = c.valueOf();

		if (typeof value === "string" || !value) {
			setSelectedLinks([]);
			return;
		}

		setSelectedLinks(links.map((l) => l.id));
	}

	function setCollectionSelected(name: string, selected: boolean) {
		const collection = linksByCollection[name];

		if (collection === undefined) {
			return;
		}

		const collectionLinksIds = collection.map((l) => l.id);

		if (selected) {
			setSelectedLinks((sl) => [...sl, ...collectionLinksIds]);
			return;
		}

		setSelectedLinks((sl) =>
			sl.filter((id) => !collectionLinksIds.includes(id)),
		);
	}

	const setLinkSelected = useCallback(
		(linkId: string, selected: boolean) => {
			setSelectedLinks((selectedLinks) => {
				if (selected && !selectedLinks.includes(linkId)) {
					return [...selectedLinks, linkId];
				}

				if (!selected) {
					return selectedLinks.filter((l) => l !== linkId);
				}

				return selectedLinks;
			});
		},
		[setSelectedLinks],
	);

	return (
		<TooltipProvider>
			<AnimatePresence>
				<header className="text-xl mb-2 flex flex-row items-center">
					<span>Select links to import</span>
					<span className="text-sm ml-4 text-neutral-500 pt-1">
						{selectedLinks.length} / {links.length} selected
					</span>
					<Button
						className="ml-auto mr-2"
						variant="outline"
						onClick={() => {
							setLinks(null);
							setSelectedLinks([]);
						}}
					>
						Back
					</Button>
					<Button
						disabled={selectedLinks.length < 1}
						onClick={onSubmitSelection}
					>
						Continue
					</Button>
				</header>
				<motion.div
					key="imported-collections"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<ImportedCollections>
						<div className="flex flex-row items-center gap-3 hover:bg-neutral-200 dark:hover:bg-neutral-800 px-3 py-2 rounded-lg">
							<Checkbox
								id="select-all-checkbox"
								checked={links.every((l) => selectedLinks.includes(l.id))}
								onCheckedChange={onSelectAll}
							/>
							<label htmlFor="select-all-checkbox">All</label>
						</div>
						{Object.entries(linksByCollection).map(([name, links]) => (
							<ImportedCollection
								key={`imported-collection-${name}`}
								name={name}
								selected={(links || []).every((l) =>
									selectedLinks.includes(l.id),
								)}
								setCollectionSelected={setCollectionSelected}
							>
								<ImportedLinks>
									{(links || []).map((l) => (
										<ImportedLinkComponent
											key={`imported-link-${l.id}`}
											link={l}
											selected={selectedLinks.includes(l.id)}
											setLinkSelected={setLinkSelected}
										/>
									))}
								</ImportedLinks>
							</ImportedCollection>
						))}
					</ImportedCollections>
				</motion.div>
			</AnimatePresence>
		</TooltipProvider>
	);
}

function Edit({ collection, edit }: { collection: string; edit: Edit }) {
	const { optimisticCollections } = useContext(CollectionsContext);

	return match(edit)
		.with({ type: "rename" }, (res) => (
			<div>
				Rename to&nbsp;
				<span className="font-semibold underline">{res.new}</span>
			</div>
		))
		.with({ type: "collapse" }, (res) => {
			const collection = optimisticCollections.find((c) => c.id === res.into);
			const collectionName =
				collection?.collection.name || "Collection not found";

			return (
				<div>
					Collapse into&nbsp;
					<span className="font-semibold underline">{collectionName}</span>
				</div>
			);
		})
		.with({ type: "keep" }, () => (
			<div>
				Create <span className="font-semibold underline">{collection}</span>
			</div>
		))
		.exhaustive();
}

function EditableCollection({
	collection,
	edit,
	setEditForCollection,
}: {
	collection: string;
	edit: Edit;
	setEditForCollection: (edit: Edit) => void;
}) {
	const [open, setOpen] = useState(false);
	const [literalValue, setLiteralValue] = useState<string>("");
	const [search, setSearch] = useState<string>("");
	const { optimisticCollections } = useContext(CollectionsContext);

	const concreteCollections = optimisticCollections.filter(
		(c) => c.type === "concrete",
	) as ConcreteCollection[];

	return (
		<div className="flex flex-row items-center gap-2">
			<span className="">{collection}</span>
			<span className="w-96 ml-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-96 justify-between"
						>
							<Edit collection={collection} edit={edit} />
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-96 p-0">
						<Command
							value={literalValue}
							onValueChange={setLiteralValue}
							filter={(value, search) => {
								if (value === "rename") return 1;
								if (value.includes(search)) return 1;
								return 0;
							}}
						>
							<CommandInput
								onValueChange={setSearch}
								placeholder="Create, rename, or collapse this collection..."
							/>
							<CommandEmpty>No existing collections.</CommandEmpty>
							<CommandGroup>
								<CommandItem
									onSelect={() => {
										setEditForCollection({ type: "keep" });
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											edit.type === "keep" ? "opacity-100" : "opacity-0",
										)}
									/>
									Create&nbsp;
									<span className="font-semibold underline">{collection}</span>
								</CommandItem>
								{search.length > 0 ? (
									<CommandItem
										value="Rename"
										onSelect={() => {
											setEditForCollection({
												type: "rename",
												old: collection,
												new: search,
											});
											setOpen(false);
											setSearch("");
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												edit.type === "rename" && edit.new === search
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										Rename to&nbsp;
										<span className="font-semibold underline">{search}</span>
									</CommandItem>
								) : null}
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup>
								{concreteCollections.map((c) => (
									<CommandItem
										key={`editable-collection-${collection}-collapse-into-${c.id}-option`}
										onSelect={() => {
											setEditForCollection({
												type: "collapse",
												into: c.id,
											});
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												edit.type === "collapse" && edit.into === c.id
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										Collapse into&nbsp;
										<span className="font-semibold underline">
											{c.collection.name}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</span>
		</div>
	);
}

type Edit = Rename | Collapse | Keep;
type Rename = { type: "rename"; old: string; new: string };
type Collapse = { type: "collapse"; into: Collection["id"] };
type Keep = { type: "keep" };

function EditLinks({
	selectedLinks,
	setPageState,
}: {
	selectedLinks: ImportedLink[];
	setPageState: React.Dispatch<React.SetStateAction<PageState>>;
}) {
	const linksByCollection = Object.groupBy(selectedLinks, (il) => il.parent);
	const collections = Object.keys(linksByCollection);
	const [edits, setEdits] = useState<Record<string, Edit>>({});

	const setEditForCollection = useCallback(
		(collection: string) => (edit: Edit) => {
			setEdits((edits) => ({ ...edits, [collection]: edit }));
		},
		[],
	);

	return (
		<TooltipProvider>
			<AnimatePresence>
				<header className="text-xl mb-4 flex flex-row items-center">
					<span>Edit collections</span>
					<Button
						className="ml-auto mr-2"
						variant="outline"
						onClick={() => setPageState("selection")}
					>
						Back
					</Button>
					<Button className="" onClick={() => {}}>
						Import
					</Button>
				</header>
				<motion.div
					key="editable-collections"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="flex flex-col gap-4"
				>
					{collections.map((c) => (
						<EditableCollection
							key={`editable-collection-${c}`}
							collection={c}
							edit={edits[c] || { type: "keep" }}
							setEditForCollection={setEditForCollection(c)}
						/>
					))}
				</motion.div>
			</AnimatePresence>
		</TooltipProvider>
	);
}

export default function ImportRaindropPage() {
	const [pageState, setPageState] = useState<PageState>("selection");
	const [links, setLinks] = useState<SelectableImportedLink[] | null>(null);
	const [selectedLinks, setSelectedLinks] = useState<string[]>([]);

	if (pageState === "selection" && links !== null) {
		return (
			<SelectLinks
				links={links}
				setLinks={setLinks}
				selectedLinks={selectedLinks}
				setSelectedLinks={setSelectedLinks}
				setPageState={setPageState}
			/>
		);
	}

	if (pageState === "editing" && links !== null) {
		return (
			<EditLinks
				selectedLinks={links
					.filter((l) => selectedLinks.includes(l.id))
					.map((l) => l.link)}
				setPageState={setPageState}
			/>
		);
	}

	return <ImportLinks setLinks={setLinks} />;
}
