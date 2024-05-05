import { useAtom } from "jotai";
import { openedFormAtom } from "@/state";
import type { Dispatch, SetStateAction } from "react";

export function useGlobalForm(
  form: string
): [boolean, Dispatch<SetStateAction<boolean>>] {
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
  ];
}
