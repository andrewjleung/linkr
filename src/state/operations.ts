import { undoLinkDeletion, undoUnsafeCollectionDeletion } from "@/app/actions";
import type { Collection, Link } from "@/database/types";
import { atom } from "jotai";

export const HISTORY_LENGTH = 50;

export type Operation = DeleteLink | DeleteCollection;
export type UndoableOperation = Operation & {
	undo: () => Promise<Operation>;
};

export type DeleteLink = {
	type: "delete-link";
	linkId: Link["id"];
};

export type DeleteCollection = {
	type: "delete-collection";
	collectionId: Collection["id"];
};

export const undoableOperationsAtom = atom<UndoableOperation[]>([]);

export function deleteLinkOp(id: Link["id"]): UndoableOperation {
	const operation: DeleteLink = {
		type: "delete-link",
		linkId: id,
	};

	return {
		...operation,
		undo: async () => {
			await undoLinkDeletion(id);
			return operation;
		},
	};
}

export function deleteCollectionOp(id: Collection["id"]): UndoableOperation {
	const operation: DeleteCollection = {
		type: "delete-collection",
		collectionId: id,
	};

	return {
		...operation,
		undo: async () => {
			await undoUnsafeCollectionDeletion(id);
			return operation;
		},
	};
}
