import type { CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "./ui/checkbox";

export function Selectable({
	children,
	selecting,
	selected,
	onSelect,
	className,
}: {
	children: React.ReactNode;
	selecting: boolean;
	selected: boolean;
	onSelect: (selected: boolean) => void;
	className?: string;
}) {
	function onCheckedChange(c: CheckedState) {
		const value = c.valueOf();

		if (typeof value === "string") {
			onSelect(false);
			return;
		}

		onSelect(value);
	}

	if (!selecting) {
		return <>{children}</>;
	}

	return (
		<div className={className}>
			<Checkbox checked={selected} onCheckedChange={onCheckedChange} />
			<div className="w-full">{children}</div>
		</div>
	);
}
