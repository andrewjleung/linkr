import type { useGlobalForm } from "@/hooks/use-global-form";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { CommandItem } from "../ui/command";

export function ToggleThemeCommand({
	setOpen,
}: {
	setOpen: ReturnType<typeof useGlobalForm>[1];
}) {
	const { theme, setTheme } = useTheme();

	if (theme === null) {
		return null;
	}

	if (theme === "system") {
		return (
			<>
				<CommandItem
					onSelect={() => {
						setOpen(false);
						setTheme("light");
					}}
					className="rounded-md"
				>
					<Sun className="mr-2 h-4 w-4" />
					<span>Turn on light mode</span>
				</CommandItem>
				<CommandItem
					onSelect={() => {
						setOpen(false);
						setTheme("dark");
					}}
					className="rounded-md"
				>
					<Moon className="mr-2 h-4 w-4" />
					<span>Turn on dark mode</span>
				</CommandItem>
			</>
		);
	}

	return (
		<>
			<CommandItem
				onSelect={() => {
					setOpen(false);
					setTheme(theme === "light" ? "dark" : "light");
				}}
				className="rounded-md"
			>
				{theme === "light" ? (
					<Moon className="mr-2 h-4 w-4" />
				) : (
					<Sun className="mr-2 h-4 w-4" />
				)}
				<span>Toggle theme</span>
			</CommandItem>
			<CommandItem
				onSelect={() => {
					setOpen(false);
					setTheme("system");
				}}
				className="rounded-md"
			>
				<SunMoon className="mr-2 h-4 w-4" />
				<span>Use system default for theme</span>
			</CommandItem>
		</>
	);
}
