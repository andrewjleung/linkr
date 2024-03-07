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
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const LINK_CUTOFF_LENGTH = 100;
const LINK_TITLE_CUTOFF_LENGTH = 50;

function LinkMenu({
  link,
  children,
}: {
  link: LinkSchema;
  children: React.ReactNode;
}) {
  const { removeOptimisticLink, moveOptimisticLink } = useContext(LinksContext);
  const { optimisticCollections } = useContext(CollectionsContext);

  const [editLinkFormOpen, setEditLinkFormOpen] = useState(false);
  const parentId = useParentCollection();

  const showMoveMenuSeparator =
    (parentId === null && optimisticCollections.length > 0) ||
    (parentId !== null && optimisticCollections.length > 1);

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
                  {showMoveMenuSeparator ? <ContextMenuSeparator /> : null}
                </>
              )}
              {optimisticCollections
                .filter((c) => c.id !== parentId)
                .map((c) => {
                  if (c.type === "abstract") {
                    return null;
                  }

                  return (
                    <ContextMenuItem
                      key={`move-to-collection-item-${c.id}`}
                      onClick={() => onClickMoveTo(c.collection)}
                    >
                      {c.collection.name}
                    </ContextMenuItem>
                  );
                })}
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

function isUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch (_) {
    return false;
  }
}

function faviconUrl(url: string, favicon: string = "/favicon.ico"): string {
  if (isUrl(favicon)) {
    return favicon;
  }

  const parsed = new URL(url);
  return `${parsed.origin}${favicon}`;
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

const OgSchema = z.object({
  ogTitle: z.optional(z.string()),
  ogDescription: z.optional(z.string()),
  favicon: z.optional(z.string()),
});

function OptimisticLink({
  optimisticLink,
}: {
  optimisticLink: OptimisticLink;
}) {
  const { data: og } = useQuery({
    queryKey: ["og", optimisticLink.id],
    queryFn: () =>
      fetch(
        `/api/opengraphs?url=${encodeURIComponent(optimisticLink.link.url)}`
      )
        .then((res) => res.json())
        .then((res) => OgSchema.parse(res.data))
        .catch((err) => null),
  });

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
            <CardHeader className="p-3">
              <CardTitle className="flex flex-row items-center justify-stretch gap-4">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={faviconUrl(link.url, og?.favicon)} />
                  <AvatarFallback>
                    <div
                      className={cn(
                        "h-full w-full scale-125 blur-sm",
                        GRADIENTS[hashLink(link) % GRADIENTS.length]
                      )}
                    />
                  </AvatarFallback>
                </Avatar>
                <span className="flex-2 truncate text-sm">
                  {displayTitle || displayUrl}
                </span>
                {displayTitle === null ? null : (
                  <span className="hidden flex-1 whitespace-nowrap text-xs text-neutral-500 sm:block">
                    {displayUrl}
                  </span>
                )}
                {optimisticLink.type === "concrete" ? (
                  <span className="flex-auto whitespace-nowrap text-end text-xs text-neutral-500">
                    {optimisticLink.link.createdAt
                      .toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })
                      .replaceAll(",", "")}
                  </span>
                ) : null}
              </CardTitle>
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
}: {
  optimisticLink: OptimisticLink;
}) {
  if (optimisticLink.type === "abstract") {
    return <OptimisticLink optimisticLink={optimisticLink} />;
  }

  return (
    <LinkMenu link={optimisticLink.link}>
      <OptimisticLink optimisticLink={optimisticLink} />
    </LinkMenu>
  );
}
