import { openedFormAtom } from "@/state";
import { useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

type FormKind =
  | "create-link-form"
  | "edit-link-form"
  | "create-collection-form"
  | "command-menu"
  | "mobile-collections-picker"
  | "rename-collection-form";

type UseGlobalDialog = [boolean, Dispatch<SetStateAction<boolean>>, boolean];

export function useGlobalDialog(form: FormKind): UseGlobalDialog {
  const [openedForm, setOpenedForm] = useAtom(openedFormAtom);

  return [
    openedForm === form,
    (value: boolean | ((value: boolean) => boolean)) => {
      if (typeof value === "boolean") {
        setOpenedForm(value ? form : null);
      } else {
        const derived = value(openedForm === form);
        setOpenedForm(derived ? form : null);
      }
    },
    openedForm !== null,
  ];
}
