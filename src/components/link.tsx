import { Link as LinkModel, Prisma } from "@prisma/client";
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
import { OptimisticLink, OptimisticLinks } from "@/hooks/use-optimistic-links";
import { deleteLink } from "@/app/actions";
import { useState } from "react";
import { EditLinkForm } from "./link-form";

function LinkMenu({
  link,
  removeOptimisticLink,
  editOptimisticLink,
  children,
}: {
  link: LinkModel;
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

function AbstractLink({ link }: { link: Prisma.LinkCreateInput }) {
  return (
    <Link href={link.url}>
      <Card className="ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-800">
        <CardHeader>
          <CardTitle className="flex flex-row text-sm">
            {link.url}
            <div className="ml-auto text-xs text-neutral-300 dark:text-neutral-700">
              {link.order || "no order"}
            </div>
          </CardTitle>
          {link.title === null ? null : (
            <CardDescription>{link.title}</CardDescription>
          )}
        </CardHeader>
        {link.description === null ? null : (
          <CardContent className="whitespace-pre-wrap text-xs">
            {link.description}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

function ConcreteLink({
  link,
  removeOptimisticLink,
  editOptimisticLink,
}: {
  link: LinkModel;
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
  editOptimisticLink: OptimisticLinks["editOptimisticLink"];
}) {
  return (
    <LinkMenu
      link={link}
      removeOptimisticLink={removeOptimisticLink}
      editOptimisticLink={editOptimisticLink}
    >
      <AbstractLink link={link} />
    </LinkMenu>
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
    <ConcreteLink
      link={optimisticLink.link}
      removeOptimisticLink={removeOptimisticLink}
      editOptimisticLink={editOptimisticLink}
    />
  );
}
