import { env } from "@/app/env.mjs";
import { CollectionsPicker } from "@/components/collections-picker";
import CollectionsProvider from "@/components/collections-provider";
import { CommandMenu } from "@/components/command-menu";
import { CommandMenuButton } from "@/components/command-menu-button";
import { MobileFooter } from "@/components/mobile-footer";
import { QCProvider } from "@/components/query-client-provider";
import Providers from "@/components/state-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { db } from "@/database/database";
import { collections as collectionsSchema } from "@/database/schema";
import { createClient } from "@/lib/supabase/server";
import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function Container({ children }: { children: React.ReactNode }) {
	const supabase = createClient();
	const { data, error } = await supabase.auth.getSession();

	if (error || !data?.session?.user) {
		redirect("/login");
	}

	if (data.session.user.id !== env.NEXT_PUBLIC_USER_ID) {
		redirect("/login");
	}

	const collections = await db
		.select()
		.from(collectionsSchema)
		.where(eq(collectionsSchema.deleted, false))
		.orderBy(asc(collectionsSchema.order));

	return (
		<Providers>
			<QCProvider>
				<CollectionsProvider collections={collections}>
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
						<div className="mx-auto flex h-full w-full max-w-5xl flex-1 gap-4 px-8 pt-8 mb-4">
							{children}
						</div>
						<div className="sm:hidden sticky bottom-8 px-6">
							<MobileFooter />
						</div>
						<footer className="h-8" />
					</main>
					<CommandMenu />
				</CollectionsProvider>
			</QCProvider>
		</Providers>
	);
}
