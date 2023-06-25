"use client";

import { deleteLink } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Link } from "@prisma/client";

export default function DeleteLinkButton({ link }: { link: Link }) {
  function onClick() {
    deleteLink(link.id);
  }

  return (
    <Button variant="outline" onClick={onClick}>
      Delete
    </Button>
  );
}
