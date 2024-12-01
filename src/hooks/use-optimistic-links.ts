import type { Collection, Link, LinkInsert } from "@/database/types";
import { orderForReorderedElement } from "@/lib/order";
import { deleteLinkOp } from "@/state/operations";
import type {
	LinkAdd,
	LinkDelete,
	LinkEdit,
	LinkReorder,
	LinkStore,
	LinkUpdate,
} from "@/store";
import type { SuccessResult } from "open-graph-scraper";
// @ts-ignore
import { createContext, startTransition, useOptimistic } from "react";
import { match } from "ts-pattern";
import { useParentCollection } from "./use-parent-collection";
import { useUndoableOperations } from "./use-undoable-operations";

const DEFAULT_LINKS_CONTEXT: OptimisticLinks = {
	optimisticLinks: [],
	async addOptimisticLink() {},
	async removeOptimisticLink() {},
	async reorderOptimisticLinks() {},
	async editOptimisticLink() {},
	async moveOptimisticLink() {},
};

export const LinksContext = createContext<OptimisticLinks>(
	DEFAULT_LINKS_CONTEXT,
);

export type AbstractLink = {
	type: "abstract";
	id: string;
	link: Pick<Link, "title" | "url" | "description" | "order">;
};

export type ConcreteLink = {
	type: "concrete";
	id: number;
	link: Link;
	og?: SuccessResult["result"];
};

export type OptimisticLink = AbstractLink | ConcreteLink;

export type OptimisticLinks = {
	optimisticLinks: OptimisticLink[];
	addOptimisticLink: (
		link: Omit<LinkInsert, "order" | "deleted">,
	) => Promise<void>;
	removeOptimisticLink: (id: number) => Promise<void>;
	reorderOptimisticLinks: (
		id: number,
		sourceIndex: number,
		destinationIndex: number,
	) => Promise<void>;
	editOptimisticLink: (id: Link["id"], edit: LinkEdit["edit"]) => Promise<void>;
	moveOptimisticLink: (
		link: Link,
		newParent: Collection | null,
	) => Promise<void>;
};

function handleAdd(
	state: OptimisticLink[],
): (add: LinkAdd) => OptimisticLink[] {
	return ({ link }) => [
		...state,
		{
			type: "abstract",
			id: crypto.randomUUID(),
			link: {
				title: link.title || null,
				url: link.url,
				description: link.description || null,
				order: Number.POSITIVE_INFINITY,
			},
		} satisfies AbstractLink,
	];
}

function handleDelete(
	state: OptimisticLink[],
): (del: LinkDelete) => OptimisticLink[] {
	return ({ id }) => state.filter((l) => l.type === "abstract" || l.id !== id);
}

function handleReorder(
	state: OptimisticLink[],
): (reorder: LinkReorder) => OptimisticLink[] {
	return ({ sourceIndex, destinationIndex }) => {
		if (state.length < 2) {
			return state;
		}

		const element = state[sourceIndex];

		const withoutSource = [
			...state.slice(0, sourceIndex),
			...state.slice(sourceIndex + 1),
		];
		return [
			...withoutSource.slice(0, destinationIndex),
			element,
			...withoutSource.slice(destinationIndex),
		];
	};
}

function handleEdit(
	state: OptimisticLink[],
): (edit: LinkEdit) => OptimisticLink[] {
	return ({ id, edit }) => {
		const updateIndex = state.findIndex((l) => l.id === id);

		if (updateIndex === -1) {
			console.error("could not find link to edit");
			return state;
		}

		const originalLink = state[updateIndex];
		const updatedLink: AbstractLink | null = (() => {
			if (originalLink.type === "abstract") {
				return null;
			}

			return {
				type: "abstract",
				id: crypto.randomUUID(),
				link: {
					...originalLink.link,
					...edit,
				},
			};
		})();

		if (updatedLink === null) {
			console.error("cannot edit abstract link");
			return state;
		}

		return [
			...state.slice(0, updateIndex),
			updatedLink,
			...state.slice(updateIndex + 1),
		];
	};
}

export function useOptimisticLinks(linkStore: LinkStore): OptimisticLinks {
	const parentId = useParentCollection();
	const { push } = useUndoableOperations();

	const concreteLinks: OptimisticLink[] = linkStore.links.map((link) => ({
		type: "concrete",
		id: link.id,
		link,
	}));

	const [optimisticLinks, updateOptimisticLinks] = useOptimistic<
		OptimisticLink[],
		LinkUpdate
	>(concreteLinks, (state: OptimisticLink[], update: LinkUpdate) =>
		match(update)
			.with({ type: "add" }, handleAdd(state))
			.with({ type: "delete" }, handleDelete(state))
			.with({ type: "reorder" }, handleReorder(state))
			.with({ type: "edit" }, handleEdit(state))
			.exhaustive(),
	);

	async function addOptimisticLink(
		link: Omit<LinkInsert, "order" | "deleted">,
	) {
		startTransition(() => updateOptimisticLinks({ type: "add", link }));
		await linkStore.addLink(link);
	}

	async function removeOptimisticLink(id: number) {
		startTransition(() => updateOptimisticLinks({ type: "delete", id }));
		await linkStore.removeLink(id);
		push(deleteLinkOp(id));
	}

	async function reorderOptimisticLinks(
		id: number,
		sourceIndex: number,
		destinationIndex: number,
	) {
		startTransition(() =>
			updateOptimisticLinks({ type: "reorder", sourceIndex, destinationIndex }),
		);

		const order = orderForReorderedElement(
			concreteLinks.map((l) => l.link.order),
			sourceIndex,
			destinationIndex,
		);

		await linkStore.reorderLink(id, order);
	}

	async function editOptimisticLink(id: Link["id"], edit: LinkEdit["edit"]) {
		startTransition(() => updateOptimisticLinks({ type: "edit", id, edit }));
		await linkStore.editLink(id, edit);
	}

	async function moveOptimisticLink(link: Link, newParent: Collection | null) {
		const newParentId = newParent?.id || null;

		if (newParentId === parentId) {
			return;
		}

		startTransition(() =>
			updateOptimisticLinks({ type: "delete", id: link.id }),
		);

		await linkStore.moveLink(link.id, newParent?.id || null);
	}

	return {
		optimisticLinks,
		addOptimisticLink,
		removeOptimisticLink,
		reorderOptimisticLinks,
		editOptimisticLink,
		moveOptimisticLink,
	};
}
