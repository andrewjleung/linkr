import { atom } from "jotai";

export const openedFormAtom = atom<string | null>(null);
export const showSidebarAtom = atom<boolean>(true);
