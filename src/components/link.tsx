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
  LinksContext,
  OptimisticLink,
} from "@/hooks/use-optimistic-links";
import { useContext, useState } from "react";
import { EditLinkForm } from "./link-form";
import { Collection, Link as LinkSchema } from "@/database/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { OgObject } from "open-graph-scraper/dist/lib/types";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { cn } from "@/lib/utils";
import hash from "object-hash";
import { HoverCard } from "@radix-ui/react-hover-card";
import { HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

const LINK_CUTOFF_LENGTH = 100;
const LINK_TITLE_CUTOFF_LENGTH = 50;

function LinkMenu({
  link,
  collections,
  children,
}: {
  link: LinkSchema;
  collections: Collection[];
  children: React.ReactNode;
}) {
  const { removeOptimisticLink, moveOptimisticLink } = useContext(LinksContext);

  const [editLinkFormOpen, setEditLinkFormOpen] = useState(false);
  const parentId = useParentCollection();

  function onClickEdit() {
    setEditLinkFormOpen(true);
  }

  function onClickDelete() {
    removeOptimisticLink(link.id);
  }

  function onClickMoveTo(collection: Collection | null) {
    moveOptimisticLink(link, collection);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem inset onClick={onClickEdit}>
            Edit
          </ContextMenuItem>
          <ContextMenuItem inset onClick={onClickDelete}>
            Delete
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {parentId === null ? null : (
                <>
                  <ContextMenuItem onClick={() => onClickMoveTo(null)}>
                    Home
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              {collections
                .filter((c) => c.id !== parentId)
                .map((c) => (
                  <ContextMenuItem
                    key={`move-to-collection-item-${c.id}`}
                    onClick={() => onClickMoveTo(c)}
                  >
                    {c.name}
                  </ContextMenuItem>
                ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
      <EditLinkForm
        link={link}
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
  "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-red-200 via-red-300 to-yellow-200",
];

function hashLink(link: AbstractLink["link"]): number {
  return parseInt(hash(link.url, { encoding: "hex" }), 16);
}

const truncateByWord = (str: string, charLimit: number) => {
  const lastWhitespace = str.lastIndexOf(" ", charLimit);
  const truncated = str.slice(0, lastWhitespace);

  return truncated.replace(/\W+$/, "");
};

function ellipsis(str: string): string {
  if (str.length < LINK_TITLE_CUTOFF_LENGTH) {
    return str;
  }

  return truncateByWord(str, LINK_TITLE_CUTOFF_LENGTH) + "...";
}

function OptimisticLink({
  optimisticLink,
  og,
}: {
  optimisticLink: OptimisticLink;
  og?: OgObject;
}) {
  const link = optimisticLink.link;
  const title = link.title || og?.ogTitle || null;
  const displayTitle = title === null ? title : ellipsis(title);

  const url = new URL(link.url);
  const displayUrl =
    link.url.length > LINK_CUTOFF_LENGTH
      ? url.hostname
      : url.hostname + (url.pathname === "/" ? "" : url.pathname);

  const description =
    [link.description, og?.ogDescription].find(Boolean) || null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href={link.url}>
          <Card className="group relative border-none shadow-none ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-800">
            {/*<div className="absolute right-2 top-2 text-xs text-neutral-300 dark:text-neutral-700">
              {link.order || "no order"}
            </div>*/}
            <CardHeader className="flex flex-row items-center space-y-0 p-2">
              <Avatar className="h-6 w-6 outline outline-1 outline-neutral-300 dark:outline-neutral-950">
                <AvatarImage src={faviconUrl(link.url)} />
                <AvatarFallback>
                  <div
                    className={cn(
                      "h-full w-full scale-125 blur-sm",
                      GRADIENTS[hashLink(link) % GRADIENTS.length]
                    )}
                  />
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 w-full">
                <CardTitle className="flex w-full flex-row items-center">
                  <span className="text-sm">{displayTitle || displayUrl}</span>
                  <span className="ml-3 text-xs text-neutral-500">
                    {displayTitle === null ? null : displayUrl}
                  </span>
                  {optimisticLink.type === "concrete" ? (
                    <span className="ml-auto text-xs text-neutral-500">
                      {optimisticLink.link.createdAt.toDateString()}
                    </span>
                  ) : null}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </HoverCardTrigger>
      {description === null ? null : (
        <HoverCardContent className="w-80">{description}</HoverCardContent>
      )}
    </HoverCard>
  );
}

export default function LinkComponent({
  optimisticLink,
  collections,
  og,
}: {
  optimisticLink: OptimisticLink;
  collections: Collection[];
  og?: OgObject;
}) {
  if (optimisticLink.type === "abstract") {
    return <OptimisticLink optimisticLink={optimisticLink} og={og} />;
  }

  return (
    <LinkMenu link={optimisticLink.link} collections={collections}>
      <OptimisticLink optimisticLink={optimisticLink} og={og} />
    </LinkMenu>
  );
}
