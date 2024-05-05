import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export type KeyPress = Pick<KeyboardEvent, "shiftKey" | "metaKey" | "key">;

export const useKeyPress = (
	keyPress: KeyPress,
	callback: (event: KeyboardEvent) => void,
	disabled = false,
	node = null,
) => {
	// implement the callback ref pattern
	const callbackRef = useRef(callback);
	useLayoutEffect(() => {
		callbackRef.current = callback;
	});

	// handle what happens on key press
	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			// check if one of the key is part of the ones we want
			if (
				event.shiftKey === keyPress.shiftKey &&
				event.metaKey === keyPress.metaKey &&
				event.key === keyPress.key
			) {
				callbackRef.current(event);
			}
		},
		[keyPress],
	);

	useEffect(() => {
		if (disabled) {
			return;
		}

		// target is either the provided node or the document
		const targetNode = node ?? document;
		// attach the event listener
		targetNode?.addEventListener("keydown", handleKeyPress);

		// remove the event listener
		return () => {
			targetNode?.removeEventListener("keydown", handleKeyPress);
		};
	}, [disabled, handleKeyPress, node]);
};
