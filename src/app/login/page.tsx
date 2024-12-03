"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { env } from "../env.mjs";
import { login } from "./actions";

export default function LoginPage() {
	const router = useRouter();

	useEffect(() => {
		(async () => {
			const supabase = createClient();
			const { data } = await supabase.auth.getSession();

			if (data?.session?.user?.id === env.NEXT_PUBLIC_USER_ID) {
				router.replace("/collections/home");
			}
		})();
	}, [router]);

	function onClick() {
		login();
	}

	return (
		<AuroraBackground className="z-0">
			<AnimatePresence>
				<motion.div
					key="login"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="w-full h-screen flex flex-col items-center justify-center lg:min-h-[600px] xl:min-h-[800px] z-10 relative"
				>
					<div className="flex items-center justify-center">
						<div className="mx-auto grid w-[350px] gap-6 z-10">
							<div className="grid gap-2 text-center">
								<h1 className="text-3xl font-bold">Welcome to linkr 👋</h1>
							</div>
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Button onClick={onClick} className="w-full">
										Login with GitHub
									</Button>
								</div>
							</div>
							<div className="text-center text-sm mt-4">
								Login is restricted.
								<Link
									href="/demo/collections/home"
									className={clsx(
										buttonVariants({ variant: "outline" }),
										"ml-3",
									)}
								>
									Try a Demo!
								</Link>
							</div>
						</div>
					</div>
					<footer className="absolute flex justify-center bottom-0 left-0 w-full text-neutral-500 p-6">
						<div className="w-full flex max-w-5xl">
							<Link
								href="https://andrewjleung.me"
								className="text-sm hover:underline"
							>
								Andrew Leung
							</Link>
							<Link
								href="https://github.com/andrewjleung/linkr"
								className="ml-auto text-sm hover:underline"
							>
								GitHub
							</Link>
						</div>
					</footer>
				</motion.div>
			</AnimatePresence>
		</AuroraBackground>
	);
}
