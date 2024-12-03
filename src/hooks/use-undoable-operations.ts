import type { Link } from "@/database/types";
import { useCallback, useState } from "react";
import { useKeyPress } from "./use-keyboard";

export const HISTORY_LENGTH = 50;

export type Operation = DeleteLink;
export type UndoableOperation = Operation & {
	undo: () => Promise<void>;
};

export type DeleteLink = {
	type: "delete-link";
	linkId: Link["id"];
};

type UndoableOperations = {
	push: (op: UndoableOperation) => void;
	undo: () => Promise<void>;
};

export function useUndoableOperations(): UndoableOperations {
	const [undoableOperations, setUndoableOperations] = useState<
		UndoableOperation[]
	>([]);

	console.log(undoableOperations);

	const push: UndoableOperations["push"] = useCallback(
		(op: UndoableOperation) => {
			setUndoableOperations((ops) => {
				if (ops.length >= HISTORY_LENGTH) {
					const [_, ...rest] = ops;
					return [...rest, op];
				}

				return [...ops, op];
			});
		},
		[],
	);

	const undo: UndoableOperations["undo"] = useCallback(async () => {
		if (undoableOperations.length < 1) {
			return;
		}

		const op = undoableOperations[undoableOperations.length - 1];
		setUndoableOperations((ops) => ops.slice(0, ops.length - 1));

		op.undo();
	}, [undoableOperations]);

	// useKeyPress({ shiftKey: false, metaKey: false, key: "z" }, (event) => {
	// 	event.preventDefault();
	// 	undo();
	// });

	return {
		push,
		undo,
	};
}
