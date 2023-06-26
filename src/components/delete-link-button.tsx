"use client";

import { deleteLink } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Link } from "@prisma/client";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

export default function DeleteLinkButton({ link }: { link: Link }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    // TODO: handle failure case
    setLoading(true);
    await deleteLink(link.id);
    setLoading(false);
  }

  return (
    <Button disabled={loading} variant="outline" size="icon" onClick={onClick}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <X className="h-4 w-4" />
      )}
    </Button>
  );
}
