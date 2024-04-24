import { buttonVariants } from "@/components/ui/button";
import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "linkr Importer",
	description: "Import links from your old bookmark manager.",
};

export default function ImportLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-2">
			<div className="col-span-1">
				<header className="mb-4">Choose an import source:</header>
				<div className="flex flex-col gap-4 w-64">
					<Link
						href="/import/raindrop"
						className={clsx(buttonVariants({ variant: "outline" }))}
					>
						Raindrop.io
					</Link>
				</div>
			</div>
			<div className="col-span-1">{children}</div>
		</div>
	);
}
