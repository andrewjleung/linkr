import type { Link } from "@/database/types";
import { ORDER_BUFFER } from "@/lib/order";
import { LINK_DATA } from "@/repository/demo-data";
import type { LinkRepository } from "@/repository/link-repository";
import { create, createStore, useStore } from "zustand";

function editAtIndex<T>(collection: T[], i: number, t: Partial<T>) {
	if (i >= collection.length) {
		return collection;
	}

	const element = collection[i];

	return [
		...collection.slice(0, i),
		{ ...element, ...t },
		...collection.slice(i + 1),
	];
}

function setLink(links: Link[], id: number, link: Partial<Link>): Link[] {
	const linkIndex = links.findIndex((l) => l.id === id);

	if (linkIndex === -1) {
		return links;
	}

	return editAtIndex(links, linkIndex, link);
}

function filterAndSortLinks(
	links: Link[],
	parentCollectionId: number | null,
): Link[] {
	return links
		.filter(
			(link) => link.parentCollectionId === parentCollectionId && !link.deleted,
		)
		.sort((a, b) => a.order - b.order);
}

export const useUnderlyingLinkStore = create<{ links: Link[] }>(() => ({
	links: LINK_DATA,
}));

export const createLinkStore = (parentCollectionId: number | null) =>
	createStore<LinkRepository>((_, get) => ({
		links: () =>
			filterAndSortLinks(
				useUnderlyingLinkStore.getState().links,
				parentCollectionId,
			),
		addLink: async (...args: Parameters<LinkRepository["addLink"]>) => {
			const id = useUnderlyingLinkStore.getState().links.length + 1;

			useUnderlyingLinkStore.setState((state) => {
				const greatestOrder = Math.max(
					...get()
						.links()
						.map((l) => l.order),
					0,
				);

				const newLink: Link = {
					...args[0],
					id,
					order: greatestOrder + ORDER_BUFFER,
					deleted: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				return {
					links: [...state.links, newLink],
				};
			});
		},
		removeLink: async (...args: Parameters<LinkRepository["removeLink"]>) => {
			useUnderlyingLinkStore.setState((state) => {
				return { links: setLink(state.links, args[0], { deleted: true }) };
			});
		},
		reorderLink: async (...args: Parameters<LinkRepository["reorderLink"]>) => {
			useUnderlyingLinkStore.setState((state) => {
				return { links: setLink(state.links, args[0], { order: args[1] }) };
			});
		},
		editLink: async (...args: Parameters<LinkRepository["editLink"]>) => {
			useUnderlyingLinkStore.setState((state) => {
				return { links: setLink(state.links, args[0], args[1]) };
			});
		},
		moveLink: async (...args: Parameters<LinkRepository["moveLink"]>) => {
			useUnderlyingLinkStore.setState((state) => {
				const greatestOrder = Math.max(
					...state.links
						.filter((l) => l.parentCollectionId === args[1])
						.map((l) => l.order),
					0,
				);

				return {
					links: setLink(state.links, args[0], {
						parentCollectionId: args[1],
						order: greatestOrder + ORDER_BUFFER,
					}),
				};
			});
		},
		undoLinkDeletion: async (
			...args: Parameters<LinkRepository["undoLinkDeletion"]>
		) => {
			useUnderlyingLinkStore.setState((state) => {
				return {
					links: setLink(state.links, args[0], {
						deleted: false,
					}),
				};
			});
		},
	}));

export type LinkStoreApi = ReturnType<typeof createLinkStore>;

export const useLinkStore = (parentCollectionId: number | null) => {
	useUnderlyingLinkStore();
	const store = useStore(createLinkStore(parentCollectionId));

	return store;
};
