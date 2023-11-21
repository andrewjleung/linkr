import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
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
import { deleteLink, editLink, moveLink } from "@/app/actions";
import { useState } from "react";
import { EditLinkForm } from "./link-form";
import { Collection, LinkInsert, Link as LinkSchema } from "@/database/types";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LinkIcon } from "lucide-react";
import { OgObject } from "open-graph-scraper/dist/lib/types";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { cn } from "@/lib/utils";

function LinkMenu({
  link,
  collections,
  removeOptimisticLink,
  editOptimisticLink,
  children,
}: {
  link: LinkSchema;
  collections: Collection[];
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
  editOptimisticLink: OptimisticLinks["editOptimisticLink"];
  children: React.ReactNode;
}) {
  const [editLinkFormOpen, setEditLinkFormOpen] = useState(false);
  const parentId = useParentCollection();

  function onClickEdit() {
    setEditLinkFormOpen(true);
  }

  async function onClickDelete() {
    removeOptimisticLink(link.id);
    await deleteLink(link.id);
  }

  async function onClickMoveTo(collectionId: Collection["id"] | null) {
    if (collectionId === parentId) {
      // TODO: Also do a toast.
      return;
    }

    removeOptimisticLink(link.id);
    await moveLink(link.id, collectionId);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem inset onClick={onClickEdit}>
            Edit
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => onClickMoveTo(null)}>
                Home
              </ContextMenuItem>
              <ContextMenuSeparator />
              {collections.map((c) => (
                <ContextMenuItem
                  key={`move-to-collection-item-${c.id}`}
                  onClick={() => onClickMoveTo(c.id)}
                >
                  {c.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
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

function faviconUrl(url: string): string {
  const parsed = new URL(url);
  return `${parsed.origin}/favicon.ico`;
}

const GRADIENTS = [
  "bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500",
  "bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-300 via-green-400 to-rose-700",
  "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-yellow-200 via-red-500 to-fuchsia-500",
  "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-700 via-orange-300 to-rose-800",
  "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-300 via-fuchsia-600 to-orange-600",
];

function AbstractLink({
  link,
  og,
}: {
  link: AbstractLink["link"];
  og?: OgObject;
}) {
  const title = [link.title, og?.ogTitle, link.url].find(Boolean) || null;
  const description =
    [link.description, og?.ogDescription].find(Boolean) || null;

  return (
    <Link href={link.url}>
      <Card className="group relative ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-800">
        <div className="absolute right-2 top-2 text-xs text-neutral-300 dark:text-neutral-700">
          {link.order || "no order"}
        </div>
        <CardHeader className="flex flex-row items-center space-y-0">
          <Avatar className="h-9 w-9 outline outline-1 outline-neutral-950">
            <AvatarImage src={faviconUrl(link.url)} />
            <AvatarFallback>
              <div
                className={cn(
                  "h-full w-full blur-sm",
                  GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
                )}
              />
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <CardTitle className="flex flex-row items-center text-sm">
              {title}
            </CardTitle>
            <CardDescription>{link.url}</CardDescription>
          </div>
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
  collections,
  og,
  removeOptimisticLink,
  editOptimisticLink,
}: {
  optimisticLink: OptimisticLink;
  collections: Collection[];
  og?: OgObject;
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
  editOptimisticLink: OptimisticLinks["editOptimisticLink"];
}) {
  if (optimisticLink.type === "abstract") {
    return <AbstractLink link={optimisticLink.link} og={og} />;
  }

  return (
    <LinkMenu
      link={optimisticLink.link}
      collections={collections}
      removeOptimisticLink={removeOptimisticLink}
      editOptimisticLink={editOptimisticLink}
    >
      <AbstractLink link={optimisticLink.link} og={og} />
    </LinkMenu>
  );
}
