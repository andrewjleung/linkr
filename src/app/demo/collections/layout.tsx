"use client";

import { RenameCollectionForm } from "@/components/collection-form";
import { CreateCollectionForm } from "@/components/collection-form";
import { CollectionsPicker } from "@/components/collections-picker";
import { DemoCollectionsProvider } from "@/components/collections-provider";
import { CommandMenu } from "@/components/command-menu";
import { CommandMenuButton } from "@/components/command-menu-button";
import { MobileFooter } from "@/components/mobile-footer";
import Providers from "@/components/state-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CollectionsLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<Providers>
			<DemoCollectionsProvider>
				<main className="relative flex min-h-screen flex-col">
					<header className="sticky top-0 z-10 w-full border-b backdrop-blur dark:border-neutral-800 hidden sm:block">
						<div className="container flex h-16 max-w-5xl flex-row items-center">
							<CollectionsPicker className="mx-auto hidden sm:mx-0 sm:block" />
							<CommandMenuButton className="ml-auto hidden sm:block" />
							<div className="ml-2 mt-0 hidden justify-self-end sm:block">
								<ThemeToggle />
							</div>
						</div>
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
