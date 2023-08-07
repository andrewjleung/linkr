"use client";

import { KeyboardContext, useKeyboard } from "@/hooks/use-keyboard";
import { ReactNode, useEffect } from "react";

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const keyboardContext = useKeyboard();

  return (
    <KeyboardContext.Provider value={keyboardContext}>
      {children}
    </KeyboardContext.Provider>
  );
}
