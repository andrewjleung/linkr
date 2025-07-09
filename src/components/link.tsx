import { HoverCard } from "@radix-ui/react-hover-card";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Collection, Link as LinkSchema } from "@/database/types";
import { useGlobalDialog } from "@/hooks/use-global-dialog";
import { CollectionsContext } from "@/hooks/use-optimistic-collections";
import {
  LinksContext,
  type OptimisticLink,
} from "@/hooks/use-optimistic-links";
import { useParentCollection } from "@/hooks/use-parent-collection";
import { EditLinkForm } from "./link-form";
import { OpenGraphContext } from "./opengraph-provider";
import { Selectable } from "./selectable";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

const LINK_CUTOFF_LENGTH = 50;

function LinkMenu({
  link,
  selected,
  onSelect,
  children,
}: {
  link: LinkSchema;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  children: React.ReactNode;
}) {
  const { removeOptimisticLink, moveOptimisticLink, undoLinkDeletion } =
    useContext(LinksContext);
  const { optimisticCollections } = useContext(CollectionsContext);

  const [editLinkFormOpen, setEditLinkFormOpen] = useState(false);
  const [, setGlobalForm] = useGlobalDialog("edit-link-form");
  const parentId = useParentCollection();

  const showMoveMenuSeparator =
    (parentId === null && optimisticCollections.length > 0) ||
    (parentId !== null && optimisticCollections.length > 1);

  function onClickEdit() {
    setEditLinkFormOpen(true);
    setGlobalForm(true);
  }

  function onClickSelect() {
    onSelect(true);
  }

  async function onClickDelete() {
    await removeOptimisticLink(link.id);

    toast.success("Link has been deleted.", {
      action: {
        label: "Undo",
        onClick: () => undoLinkDeletion(link.id),
      },
    });
  }

  async function onClickMoveTo(collection: Collection | null) {
    await moveOptimisticLink(
      link.id,
      collection === null ? null : collection.id,
    );

    const newParentName = collection?.name || "Home";
    toast.success(`Link has been moved to collection "${newParentName}"`);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem inset onClick={onClickEdit}>
            Edit
          </ContextMenuItem>

          <ContextMenuItem inset onClick={onClickSelect}>
            {selected ? "Unselect" : "Select"}
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
        onOpen={(open) => {
          setEditLinkFormOpen(open);
          setGlobalForm(open);
        }}
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

function faviconUrl(url: string, favicon = "/favicon.ico"): string {
  if (isUrl(favicon)) {
    return favicon;
  }

  const parsed = new URL(url);
  return `${parsed.origin}${favicon}`;
}

function OptimisticLinkComponent({
  optimisticLink,
  showIcon,
}: {
  optimisticLink: OptimisticLink;
  showIcon: boolean;
}) {
  const ogs = useContext(OpenGraphContext);
  const ogsMap = new Map(ogs);
  const og =
    optimisticLink.type === "concrete"
      ? ogsMap.get(optimisticLink.id)
      : undefined;

  const link = optimisticLink.link;
  const title = link.title || og?.ogTitle || null;

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
          <Card className="py-0 group bg-transparent relative border-none shadow-none ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-800 ease-in-out">
            {/*<div className="absolute left-2 text-xs text-neutral-300 dark:text-neutral-700">
							{link.order || "no order"}
						</div> */}
            <CardContent className="p-3">
              <div className="flex flex-row items-center justify-stretch gap-4">
                {showIcon ? (
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={faviconUrl(link.url, og?.favicon)}
                      alt={`${link.url} favicon`}
                    />
                    <AvatarFallback className="bg-none">
                      <LinkIcon className="h-3 w-3 dark:text-neutral-400 text-neutral-600" />
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <span className="flex-[0_1_fit-content] line-clamp-1 text-sm">
                  {title || displayUrl}
                </span>
                {title === null ? null : (
                  <span className="hidden flex-1 whitespace-nowrap text-xs dark:text-neutral-400 text-neutral-500 sm:block">
                    {displayUrl}
                  </span>
                )}
                {optimisticLink.type === "concrete" ? (
                  <>
                    <span className="hidden sm:block flex-auto whitespace-nowrap text-end text-xs dark:text-neutral-400 text-neutral-500">
                      {optimisticLink.link.createdAt
                        .toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })
                        .replaceAll(",", "")}
                    </span>
                    <span className="sm:hidden flex-auto whitespace-nowrap text-end text-xs text-neutral-500">
                      {optimisticLink.link.createdAt
                        .toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                        .replaceAll(",", "")}
                    </span>
                  </>
                ) : null}
              </div>
            </CardContent>
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
  selecting,
  selected,
  onSelect,
  showIcon,
}: {
  optimisticLink: OptimisticLink;
  selecting: boolean;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  showIcon: boolean;
}) {
  if (optimisticLink.type === "abstract") {
    return (
      <OptimisticLinkComponent
        optimisticLink={optimisticLink}
        showIcon={showIcon}
      />
    );
  }

  return (
    <LinkMenu
      selected={selected}
      onSelect={onSelect}
      link={optimisticLink.link}
    >
      <Selectable
        selecting={selecting}
        selected={selected}
        onSelect={onSelect}
        className="flex flex-row items-center gap-2 pl-3"
      >
        <OptimisticLinkComponent
          optimisticLink={optimisticLink}
          showIcon={showIcon}
        />
      </Selectable>
    </LinkMenu>
  );
}
