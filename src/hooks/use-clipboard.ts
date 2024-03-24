import { useEffect } from "react";
import { useState } from "react";

export function useClipboard() {
  const [clipboard, setClipboard] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof navigator.clipboard.readText === "undefined") return;

    navigator.clipboard.readText().then((text) => setClipboard(text));
  }, []);

  return clipboard;
}
