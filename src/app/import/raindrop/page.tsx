"use client";

import { insertImports, parseRaindropImport } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ImportedLink } from "@/services/import-service";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { Info, SquareArrowOutUpRight } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
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

export default function ImportRaindropPage() {
	const [links, setLinks] = useState<SelectableImportedLink[] | null>(null);
	const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
	const form = useForm<z.infer<typeof raindropImportFormSchema>>({
		resolver: zodResolver(raindropImportFormSchema),
	});

	const linksByCollection: Record<string, SelectableImportedLink[]> =
		links === null ? null : Object.groupBy(links, (il) => il.link.parent);

	async function onSubmit(values: z.infer<typeof raindropImportFormSchema>) {
		const ab = await values.file.arrayBuffer();
		const serialized = new TextDecoder().decode(ab);
		const importedLinks = await parseRaindropImport(serialized);
		setLinks(
			importedLinks.map((il) => ({
				id: crypto.randomUUID(),
				link: il,
			})),
		);
	}

	const setLinkSelected = useCallback((linkId: string, selected: boolean) => {
		setSelectedLinks((selectedLinks) => {
			if (selected && !selectedLinks.includes(linkId)) {
				return [...selectedLinks, linkId];
			}

			if (!selected) {
				return selectedLinks.filter((l) => l !== linkId);
			}

			return selectedLinks;
		});
	}, []);

	function setCollectionSelected(name: string, selected: boolean) {
		const collectionLinksIds = linksByCollection[name].map((l) => l.id);

		if (selected) {
			setSelectedLinks((sl) => [...sl, ...collectionLinksIds]);
			return;
		}

		setSelectedLinks((sl) =>
			sl.filter((id) => !collectionLinksIds.includes(id)),
		);
	}

	function onSelectAll(c: CheckedState): void {
		if (links === null) {
			return;
		}

		const value = c.valueOf();

		if (typeof value === "string" || !value) {
			setSelectedLinks([]);
			return;
		}

		setSelectedLinks(links.map((l) => l.id));
	}

	async function onSubmitSelection() {
		if (links === null) {
			return;
		}

		await insertImports(
			links.filter((l) => selectedLinks.includes(l.id)).map((l) => l.link),
		);
	}

	if (linksByCollection !== null && links !== null) {
		return (
			<TooltipProvider>
				<AnimatePresence>
					<header className="text-xl mb-2 flex flex-row">
						<span>Select links to import 👇</span>
						<Button
							disabled={selectedLinks.length < 1}
							className="ml-auto"
							onClick={onSubmitSelection}
						>
							Continue
						</Button>
					</header>
					<motion.div
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
									selected={links.every((l) => selectedLinks.includes(l.id))}
									setCollectionSelected={setCollectionSelected}
								>
									<ImportedLinks>
										{links.map((l) => (
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

	return (
		<AnimatePresence>
			<Form {...form}>
				<motion.form
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
