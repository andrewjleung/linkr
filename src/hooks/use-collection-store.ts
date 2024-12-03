import type { Collection } from "@/database/types";
import { ORDER_BUFFER } from "@/lib/order";
import type { CollectionRepository } from "@/repository/collection-repository";
import { COLLECTION_DATA } from "@/repository/demo-data";
import { create, createStore, useStore } from "zustand";
import { createLinkStore } from "./use-link-store";

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

function setCollection(
	collections: Collection[],
	id: number,
	collection: Partial<Collection>,
): Collection[] {
	const collectionIndex = collections.findIndex((c) => c.id === id);

	if (collectionIndex === -1) {
		return collections;
	}

	return editAtIndex(collections, collectionIndex, collection);
}

export const useUnderlyingCollectionStore = create<{
	collections: Collection[];
}>(() => ({
	collections: COLLECTION_DATA,
}));

export const createCollectionStore = () =>
	createStore<CollectionRepository>((_, get) => ({
		collections: () =>
			useUnderlyingCollectionStore
				.getState()
				.collections.filter((c) => !c.deleted)
				.sort((a, b) => a.order - b.order),
		addCollection: async (
			...args: Parameters<CollectionRepository["addCollection"]>
		) => {
			const id = useUnderlyingCollectionStore.getState().collections.length + 1;

			useUnderlyingCollectionStore.setState((state) => {
				const greatestOrder = Math.max(
					...get()
						.collections()
						.map((l) => l.order),
					0,
				);

				const newCollection: Collection = {
					...args[0],
					id,
					order: greatestOrder + ORDER_BUFFER,
					deleted: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				return { collections: [...state.collections, newCollection] };
			});

			return get()
				.collections()
				.find((c) => c.id === id);
		},
		safeRemoveCollection: async (
			...args: Parameters<CollectionRepository["safeRemoveCollection"]>
		) => {
			const ls = createLinkStore(args[0]);
			const links = ls
				.getState()
				.links()
				.filter((l) => l.parentCollectionId === args[0]);

			for (const link of links) {
				await ls.getState().moveLink(link.id, null);
			}

			useUnderlyingCollectionStore.setState((state) => {
				return {
					collections: setCollection(state.collections, args[0], {
						deleted: true,
					}),
				};
			});
		},
		unsafeRemoveCollection: async (
			...args: Parameters<CollectionRepository["unsafeRemoveCollection"]>
		) => {
			const ls = createLinkStore(args[0]);
			const links = ls
				.getState()
				.links()
				.filter((l) => l.parentCollectionId === args[0]);

			for (const link of links) {
				await ls.getState().removeLink(link.id);
			}

			useUnderlyingCollectionStore.setState((state) => {
				return {
					collections: setCollection(state.collections, args[0], {
						deleted: true,
					}),
				};
			});
		},
		reorderCollection: async (
			...args: Parameters<CollectionRepository["reorderCollection"]>
		) => {
			useUnderlyingCollectionStore.setState((state) => {
				return {
					collections: setCollection(state.collections, args[0], {
						order: args[1],
					}),
				};
			});
		},
		renameCollection: async (
			...args: Parameters<CollectionRepository["renameCollection"]>
		) => {
			useUnderlyingCollectionStore.setState((state) => {
				return {
					collections: setCollection(state.collections, args[0], {
						name: args[1],
					}),
				};
			});
		},
	}));

export type CollectionStoreApi = ReturnType<typeof createCollectionStore>;

export const useCollectionStore = () => {
	useUnderlyingCollectionStore();
	const store = useStore(createCollectionStore());

	return store;
};
