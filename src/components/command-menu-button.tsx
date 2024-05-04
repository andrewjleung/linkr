"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openedFormAtom } from "@/state";
import { useAtom } from "jotai";

export function CommandMenuButton({ className }: { className?: string }) {
	const [, setOpenedForm] = useAtom(openedFormAtom);

	return (
		<Button
			variant="outline"
			className={cn("pr-2", className)}
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
