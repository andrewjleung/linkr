"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { env } from "../env.mjs";
import { login } from "./actions";

export default function LoginPage() {
	const router = useRouter();

	useEffect(() => {
		(async () => {
			const supabase = createClient();
			const { data } = await supabase.auth.getUser();

			if (data?.user?.id === env.NEXT_PUBLIC_USER_ID) {
				router.replace("/collections/home");
			}
		})();
	}, [router]);

	function onClick() {
		login();
	}

	return (
		<div className="w-full h-screen flex items-center justify-center lg:min-h-[600px] xl:min-h-[800px]">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-6">
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
					<div className="mt-4 text-center text-sm">
						Sign-in is restricted to specific users.
					</div>
				</div>
			</div>
		</div>
	);
}
