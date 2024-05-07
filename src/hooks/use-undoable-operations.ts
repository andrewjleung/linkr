import {
	HISTORY_LENGTH,
	type Operation,
	type UndoableOperation,
	undoableOperationsAtom,
} from "@/state/operations";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { useKeyPress } from "./use-keyboard";

type UndoableOperations = {
	push: (op: UndoableOperation) => void;
	undo: () => Promise<Operation | null>;
};

export function useUndoableOperations(): UndoableOperations {
	const [undoableOperations, setUndoableOperations] = useAtom(
		undoableOperationsAtom,
	);

	const push: UndoableOperations["push"] = useCallback(
		(op: UndoableOperation) => {
			if (undoableOperations.length >= HISTORY_LENGTH) {
				setUndoableOperations((ops) => {
					const [_, ...rest] = ops;
					return [...rest, op];
				});
			}

			setUndoableOperations((ops) => [...ops, op]);
		},
		[setUndoableOperations, undoableOperations.length],
	);

	const undo: UndoableOperations["undo"] = useCallback(() => {
		const op = undoableOperations.pop();

		if (op === undefined) {
			return Promise.resolve(null);
		}

		return op.undo();
	}, [undoableOperations]);

	useKeyPress({ shiftKey: false, metaKey: true, key: "z" }, (event) => {
		event.preventDefault();
		undo();
	});

	return {
		push,
		undo,
	};
}
