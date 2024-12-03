import type { Collection, Link, LinkInsert } from "@/database/types";

export type LinkAdd = {
	type: "add";
	link: Omit<LinkInsert, "order">;
};

export type LinkDelete = {
	type: "delete";
	id: number;
};

export type LinkReorder = {
	type: "reorder";
	sourceIndex: number;
	destinationIndex: number;
};

export type LinkEdit = {
	type: "edit";
	id: Link["id"];
	edit: Pick<Link, "title" | "url" | "description">;
};

export type LinkDeleteUndo = {
	type: "undo-delete";
	id: number;
};

export type LinkUpdate =
	| LinkAdd
	| LinkDelete
	| LinkReorder
	| LinkEdit
	| LinkDeleteUndo;

export type LinkRepository = {
	links: () => Link[];
	addLink: (link: Omit<LinkInsert, "order" | "deleted">) => Promise<void>;
	removeLink: (id: number) => Promise<void>;
	reorderLink: (id: number, order: number) => Promise<void>;
	editLink: (id: Link["id"], edit: LinkEdit["edit"]) => Promise<void>;
	moveLink: (
		id: Link["id"],
		newParent: Collection["id"] | null,
	) => Promise<void>;
	undoLinkDeletion: (id: number) => Promise<void>;
};

export type CollectionStore = {
	collections: Collection[];
};
