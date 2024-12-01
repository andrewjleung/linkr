import type { Collection, Link } from "@/database/types";
import { ORDER_BUFFER } from "@/lib/order";
import type { CollectionStore, LinkStore } from "@/store";
import { create } from "zustand";

// export const useCollectionStore = create<CollectionStore>((set) => ({
// 	collections: [],
// }));

export const useCollectionStore = create<CollectionStore>((set) => ({
	collections: [],
}));

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

function setLink(
	state: LinkStore,
	id: number,
	link: Partial<Link>,
): Partial<LinkStore> {
	const linkIndex = state.links.findIndex((l) => l.id === id);

	if (linkIndex === -1) {
		return state;
	}

	return {
		links: editAtIndex(state.links, linkIndex, link),
	};
}

export const useLinkStore = (links: Link[]) =>
	create<LinkStore>((set) => ({
		links: links,
		addLink: async (...args: Parameters<LinkStore["addLink"]>) => {
			set((state) => {
				const greatestOrder = Math.max(...state.links.map((l) => l.order), 0);

				const newLink: Link = {
					...args[0],
					id: 1,
					order: greatestOrder + ORDER_BUFFER,
					deleted: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				return { links: [...state.links, newLink] };
			});
		},
		removeLink: async (...args: Parameters<LinkStore["removeLink"]>) => {
			set((state) => {
				return setLink(state, args[0], { deleted: true });
			});
		},
		reorderLink: async (...args: Parameters<LinkStore["reorderLink"]>) => {
			set((state) => {
				return setLink(state, args[0], { order: args[1] });
			});
		},
		editLink: async (...args: Parameters<LinkStore["editLink"]>) => {
			set((state) => {
				return setLink(state, args[0], args[1]);
			});
		},
		moveLink: async (...args: Parameters<LinkStore["moveLink"]>) => {
			set((state) => {
				return setLink(state, args[0], { parentCollectionId: args[1] });
			});
		},
	}));
