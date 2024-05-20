"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Collection } from "@/database/types";
import { useGlobalDialog } from "@/hooks/use-global-dialog";
import { useKeyPress } from "@/hooks/use-keyboard";
import {
	CollectionsContext,
	type ConcreteCollection,
	OptimisticCollections,
} from "@/hooks/use-optimistic-collections";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const collectionSchema = z.object({
	name: z.string().nonempty(),
});

const DEFAULT_FORM_VALUES = {
	name: "",
};

export function RenameCollectionForm() {
	const { optimisticCollections } = useContext(CollectionsContext);
	const parentId = useParentCollection();
	const collection = optimisticCollections.find(
		(c) => c.type === "concrete" && c.id === parentId,
	) as ConcreteCollection | undefined;
	const [open, setOpen] = useGlobalDialog("rename-collection-form");
	const { renameCollection } = useContext(CollectionsContext);
	const [loading, setLoading] = useState(false);

	const form = useForm<z.infer<typeof collectionSchema>>({
		resolver: zodResolver(collectionSchema),
		defaultValues: {
			name: collection?.collection.name || "",
		},
	});

	async function onSubmit(values: z.infer<typeof collectionSchema>) {
		if (collection === undefined) {
			return;
		}

		setLoading(true);
		setOpen(false);

		// TODO: handle failure case
		await renameCollection(collection.collection.id, values.name);
		setLoading(false);
		toast.success(`Collection has been renamed to ${values.name}`);
	}

	if (collection === undefined) {
		return null;
	}

	return (
		<CollectionFormInner
			key={`rename-collection-form-${open}-${collection.id}`}
			title="Rename collection"
			form={form}
			open={open}
			setOpen={setOpen}
			loading={loading}
			onSubmit={onSubmit}
		/>
	);
}

const CREATE_COLLECTION_FORM = "create-collection-form";
const CREATE_LINK_FORM = "create-link-form";

export function CreateCollectionForm() {
	const { addCollection } = useContext(CollectionsContext);
	const [loading, setLoading] = useState(false);
	const parentId = useParentCollection();
	const [open, setOpen] = useGlobalDialog(CREATE_COLLECTION_FORM);
	const [createLinkFormOpen] = useGlobalDialog(CREATE_LINK_FORM);
	const router = useRouter();

	const form = useForm<z.infer<typeof collectionSchema>>({
		resolver: zodResolver(collectionSchema),
		defaultValues: DEFAULT_FORM_VALUES,
	});

	useKeyPress(
		{ shiftKey: true, metaKey: false, key: "Q" },
		(event) => {
			event.preventDefault();
			setOpen(true);
		},
		open || createLinkFormOpen,
	);

	async function onSubmit(values: z.infer<typeof collectionSchema>) {
		setLoading(true);
		form.reset(DEFAULT_FORM_VALUES);
		setOpen(false);

		// TODO: handle failure case
		const collection = await addCollection({
			name: values.name,
			parentCollectionId: null,
		});

		setLoading(false);

		toast.success(`Collection "${collection.name}" has been created.`, {
			action: {
				label: "Go to",
				onClick: () => router.push(`/collections/${collection.id}`),
			},
		});
	}

	return (
		<CollectionFormInner
			key={`create-collection-form-${open}-${parentId}`}
			title="Add a new collection"
			form={form}
			open={open}
			setOpen={setOpen}
			loading={loading}
			onSubmit={onSubmit}
		/>
	);
}

function CollectionFormInner({
	title,
	form,
	open,
	setOpen,
	loading,
	onSubmit,
}: {
	title: string;
	form: UseFormReturn<z.infer<typeof collectionSchema>>;
	open: boolean;
	setOpen: (open: boolean) => void;
	loading: boolean;
	onSubmit: (values: z.infer<typeof collectionSchema>) => Promise<void>;
}) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-row items-center justify-center"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							disabled={loading}
							variant="outline"
							size="icon"
							type="submit"
							className="mb-auto ml-4"
						>
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Plus className="h-4 w-4" />
							)}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
