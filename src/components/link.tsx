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
import { startTransition } from "react";

function AbstractLink({ link }: { link: Prisma.LinkCreateInput }) {
  return (
    <Link href={link.url} className="animate-pulse">
      <Card className="ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-800">
        <CardHeader>
          {link.title === null ? null : <CardTitle>{link.title}</CardTitle>}
          <CardDescription>{link.url}</CardDescription>
        </CardHeader>
        {link.description === null ? null : (
          <CardContent className="whitespace-pre-wrap">
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
}: {
  link: LinkModel;
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
}) {
  function onClickEdit() {}

  async function onClickDelete() {
    startTransition(() => {
      removeOptimisticLink(link.id);
    });
    await deleteLink(link.id);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Link href={link.url}>
            <Card className="ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-800">
              <CardHeader>
                {link.title === null ? null : (
                  <CardTitle>{link.title}</CardTitle>
                )}
                <CardDescription>{link.url}</CardDescription>
              </CardHeader>
              {link.description === null ? null : (
                <CardContent className="whitespace-pre-wrap">
                  {link.description}
                </CardContent>
              )}
            </Card>
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem inset onClick={onClickEdit}>
            Edit
          </ContextMenuItem>
          <ContextMenuItem inset onClick={onClickDelete}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}

export default function LinkComponent({
  optimisticLink,
  removeOptimisticLink,
}: {
  optimisticLink: OptimisticLink;
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
}) {
  if (optimisticLink.type === "abstract") {
    return <AbstractLink link={optimisticLink.link} />;
  }

  return (
    <ConcreteLink
      link={optimisticLink.link}
      removeOptimisticLink={removeOptimisticLink}
    />
  );
}
