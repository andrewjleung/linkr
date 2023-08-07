import {
  useEffect,
  createContext,
  useState,
  useCallback,
  useContext,
} from "react";

export type KeyPress = {
  metaKey: KeyboardEvent["metaKey"];
  code: KeyboardEvent["code"];
};

export type KeyboardMapping = Record<
  string,
  (() => void) | (() => Promise<void>)
>;

export type KeyboardContext = {
  addMapping: (
    keyPress: KeyPress,
    callback: (() => void) | (() => Promise<void>)
  ) => () => void;
  addTempMapping: (
    keyPress: KeyPress,
    callback: (() => void) | (() => Promise<void>)
  ) => void;
  removeMapping: (keyPress: KeyPress) => void;
};

export const KeyboardContext = createContext<KeyboardContext>({
  addMapping:
    (keyPress: KeyPress, callback: (() => void) | (() => Promise<void>)) =>
    () => {},
  addTempMapping: (
    keyPress: KeyPress,
    callback: (() => void) | (() => Promise<void>)
  ) => {},
  removeMapping: () => {},
});

export const KEYPRESSES: Record<"new" | "escape" | "command", KeyPress> = {
  new: { metaKey: true, code: "KeyN" },
  escape: { metaKey: false, code: "Escape" },
  command: { metaKey: true, code: "KeyK" },
};

export function useKeyboard(): KeyboardContext {
  const [mappings, setMappings] = useState<KeyboardMapping>({});
  console.log(mappings);

  useEffect(() => {
    const callback = (event: KeyboardEvent) => {
      const keypressString = JSON.stringify({
        metaKey: event.metaKey,
        code: event.code,
      });

      if (keypressString in mappings) {
        mappings[keypressString]();
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [mappings]);

  const removeMapping = useCallback((keyPress: KeyPress) => {
    const keypressString = JSON.stringify(keyPress);

    setMappings((mappings) =>
      Object.keys(mappings)
        .filter((k) => k !== keypressString)
        .reduce<KeyboardMapping>((acc, k) => ({ ...acc, [k]: mappings[k] }), {})
    );
  }, []);

  const addMapping = useCallback(
    (keyPress: KeyPress, callback: (() => void) | (() => Promise<void>)) => {
      const keypressString = JSON.stringify(keyPress);

      setMappings((mappings) => ({ ...mappings, [keypressString]: callback }));

      return () => {
        removeMapping(keyPress);
      };
    },
    [removeMapping]
  );

  const addTempMapping = useCallback(
    (keyPress: KeyPress, callback: (() => void) | (() => Promise<void>)) => {
      const keypressString = JSON.stringify(keyPress);

      setMappings((mappings) => ({
        ...mappings,
        [keypressString]: () => {
          callback();
          removeMapping(keyPress);
        },
      }));
    },
    [removeMapping]
  );

  return {
    addMapping,
    addTempMapping,
    removeMapping,
  };
}
