import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  AbstractLink,
  ConcreteLink,
  OptimisticLink,
  OptimisticLinks,
} from "@/hooks/use-optimistic-links";
import { deleteLink } from "@/app/actions";
import { useState } from "react";
import { EditLinkForm } from "./link-form";
import { LinkInsert, Link as LinkSchema } from "@/database/types";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LinkIcon } from "lucide-react";
import ogs from "open-graph-scraper";
import { LinkWithOg } from "@/app/page";

function LinkMenu({
  link,
  removeOptimisticLink,
  editOptimisticLink,
  children,
}: {
  link: LinkSchema;
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
  editOptimisticLink: OptimisticLinks["editOptimisticLink"];
  children: React.ReactNode;
}) {
  const [editLinkFormOpen, setEditLinkFormOpen] = useState(false);

  function onClickEdit() {
    setEditLinkFormOpen(true);
  }

  async function onClickDelete() {
    removeOptimisticLink(link.id);
    await deleteLink(link.id);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem inset onClick={onClickEdit}>
            Edit
          </ContextMenuItem>
          <ContextMenuItem inset onClick={onClickDelete}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <EditLinkForm
        link={link}
        editOptimisticLink={editOptimisticLink}
        open={editLinkFormOpen}
        setOpen={setEditLinkFormOpen}
      />
    </>
  );
}

function AbstractLink({ link }: { link: AbstractLink["link"] }) {
  const title = [link.title, link.og?.ogTitle, link.url].find(Boolean) || null;
  const description =
    [link.description, link.og?.ogDescription].find(Boolean) || null;

  return (
    <Link href={link.url}>
      <Card className="group relative ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-800">
        <div className="absolute right-2 top-2 text-xs text-neutral-300 dark:text-neutral-700">
          {link.order || "no order"}
        </div>
        <CardHeader>
          <CardTitle className="flex flex-row items-center text-sm">
            {title}
          </CardTitle>
          <CardDescription>{link.url}</CardDescription>
        </CardHeader>
        {description === null ? null : (
          <CardContent className="whitespace-pre-wrap text-xs">
            {description}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

export default function LinkComponent({
  optimisticLink,
  removeOptimisticLink,
  editOptimisticLink,
}: {
  optimisticLink: OptimisticLink;
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
  editOptimisticLink: OptimisticLinks["editOptimisticLink"];
}) {
  if (optimisticLink.type === "abstract") {
    return <AbstractLink link={optimisticLink.link} />;
  }

  return (
    <LinkMenu
      link={optimisticLink.link}
      removeOptimisticLink={removeOptimisticLink}
      editOptimisticLink={editOptimisticLink}
    >
      <AbstractLink link={optimisticLink.link} />
    </LinkMenu>
  );
}
