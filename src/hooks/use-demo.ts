import { usePathname } from "next/navigation";
import { useCallback } from "react";

export function useDemo() {
	const pathname = usePathname();
	const isDemo = pathname.startsWith("/demo");
	const demoLink = useCallback(
		(path: string) => {
			if (isDemo) {
				return `/demo/${path}`;
			}

			return path;
		},
		[isDemo],
	);

	return { isDemo: pathname.startsWith("/demo"), demoLink };
}
