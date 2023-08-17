"use client";

import { useKeyPress } from "@/hooks/use-keyboard";
import { CreateLinkForm } from "./create-link-form";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { ReactNode, useState } from "react";

export default function LinksView({ children }: { children: ReactNode }) {
  const [createLinkFormIsOpen, setCreateLinkFormIsOpen] = useState(false);
  const parentId = useParentCollection();

  useKeyPress(
    { metaKey: false, code: "KeyQ" },
    (event) => {
      event.preventDefault();
      setCreateLinkFormIsOpen(true);
    },
    createLinkFormIsOpen
  );

  return (
    <>
      {children}
      <CreateLinkForm
        key={`${parentId}-${createLinkFormIsOpen}`}
        parentId={parentId}
        open={createLinkFormIsOpen}
        setOpen={setCreateLinkFormIsOpen}
      />
    </>
  );
}
