"use client";

import { Link as LinkModel } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  MutableRefObject,
  useRef,
  useState,
  forwardRef,
  useEffect,
  useCallback,
  useContext,
  Dispatch,
  SetStateAction,
  KeyboardEventHandler,
} from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  deleteLink,
  renameCollection,
  safeDeleteCollection,
  unsafeDeleteCollection,
} from "@/app/actions";
import { useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LinkComponent({ link }: { link: LinkModel }) {
  const [loading, setLoading] = useState(false);

  function onClickEdit() {}

  async function onClickDelete() {
    setLoading(true);
    await deleteLink(link.id);
    setLoading(false);
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
                <CardContent>{link.description}</CardContent>
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
