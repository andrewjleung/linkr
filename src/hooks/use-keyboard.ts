import { useEffect, useCallback, useRef, useLayoutEffect } from "react";

export type KeyPress = {
  metaKey: KeyboardEvent["metaKey"];
  code: KeyboardEvent["code"];
};

export const useKeyPress = (
  keyPress: KeyPress,
  callback: (event: KeyboardEvent) => void,
  disabled: boolean = false,
  node = null
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
      if (event.metaKey === keyPress.metaKey && event.code === keyPress.code) {
        callbackRef.current(event);
      }
    },
    [keyPress]
  );

  useEffect(() => {
    if (disabled) {
      return;
    }

    // target is either the provided node or the document
    const targetNode = node ?? document;
    // attach the event listener
    targetNode && targetNode.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      targetNode && targetNode.removeEventListener("keydown", handleKeyPress);
    };
  }, [disabled, handleKeyPress, node]);
};
