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

	return <Button onClick={onClick}>Sign in with GitHub</Button>;
}
