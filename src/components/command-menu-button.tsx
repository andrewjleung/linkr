"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openedFormAtom } from "@/state";
import clsx from "clsx";
import { useAtom } from "jotai";

export function CommandMenuButton({ className }: { className?: string }) {
	const [openedForm, setOpenedForm] = useAtom(openedFormAtom);

	console.log(openedForm);

	return (
		<Button
			variant="outline"
			className={clsx("pr-2", className)}
			onClick={() => setOpenedForm("command-menu")}
		>
			Commands
			<Badge
				variant="secondary"
				className="ml-2 scale-90 rounded-md px-2 text-xs"
			>
				⌘ K
			</Badge>
		</Button>
	);
}
