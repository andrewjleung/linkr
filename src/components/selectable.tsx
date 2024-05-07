import type { CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "./ui/checkbox";

export function Selectable({
	children,
	selecting,
	selected,
	setSelected,
	className,
}: {
	children: React.ReactNode;
	selecting: boolean;
	selected: boolean;
	setSelected: (selected: boolean) => void;
	className?: string;
}) {
	function onCheckedChange(c: CheckedState) {
		const value = c.valueOf();

		if (typeof value === "string") {
			setSelected(false);
			return;
		}

		setSelected(value);
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
