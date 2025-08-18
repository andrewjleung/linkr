"use client";

import clsx from "clsx";
import Link from "next/link";
import {
  CreateCollectionForm,
  RenameCollectionForm,
} from "@/components/collection-form";
import { CollectionsPicker } from "@/components/collections-picker";
import { DemoCollectionsProvider } from "@/components/collections-provider";
import { CommandMenu } from "@/components/command-menu";
import { CommandMenuButton } from "@/components/command-menu-button";
import { MobileFooter } from "@/components/mobile-footer";
import Providers from "@/components/state-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDemo } from "@/hooks/use-demo";

function DemoBanner({ className }: { className?: string }) {
  const { isDemo } = useDemo();

  if (!isDemo) {
    return null;
  }

  return (
    <div
      className={clsx(
        "flex justify-center py-2 backdrop-blur dark:border-neutral-800 sm:text-xs text-sm dark:text-neutral-500",
        className,
      )}
    >
      <span>
        You are using a demo version of linkr, links and collections will not be
        be saved.{" "}
        <Link href="/login" className="underline">
          Click here to login.
        </Link>
      </span>
    </div>
  );
}

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <DemoCollectionsProvider>
        <main className="relative flex min-h-screen flex-col">
          <header className="sticky flex-col top-0 z-10 w-full border-b backdrop-blur items-center dark:border-neutral-800 flex justify-center">
            <div className="container px-8 h-16 max-w-5xl flex-row items-center hidden sm:flex">
              <CollectionsPicker className="mx-auto hidden sm:mx-0 sm:block" />
              <CommandMenuButton className="ml-auto hidden sm:block" />
              <div className="ml-2 mt-0 hidden justify-self-end sm:block">
                <ThemeToggle />
              </div>
            </div>

            <DemoBanner className="w-full px-8 sm:border-t" />
          </header>

          <div className="mx-auto flex h-full w-full max-w-5xl flex-1 gap-4 px-8 pt-8 mb-24">
            {children}
          </div>

          <footer className="sm:hidden sticky bottom-8 px-6">
            <MobileFooter />
          </footer>
        </main>

        <CommandMenu />
        <CreateCollectionForm />
        <RenameCollectionForm />
      </DemoCollectionsProvider>
    </Providers>
  );
}
