"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function ImportPage() {
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="mx-auto mt-12 w-fit"
			>
				<div className="mb-4">Choose an import source:</div>
				<div className="flex flex-col gap-4 w-64">
					<Link
						href="/import/raindrop"
						className={cn(buttonVariants({ variant: "outline" }))}
					>
						Raindrop.io
					</Link>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
