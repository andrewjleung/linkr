import { buttonVariants } from "@/components/ui/button";
import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "linkr Importer",
	description: "Import links from your old bookmark manager.",
};

export default function ImportPage() {
	return (
		<div>
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
	);
}
