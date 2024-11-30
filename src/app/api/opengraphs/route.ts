import { env } from "@/app/env.mjs";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

async function loggedIn(): Promise<boolean> {
	const client = createClient();

	const {
		data: { user },
		error,
	} = await client.auth.getUser();

	return error === null && user !== null && user.id === env.NEXT_PUBLIC_USER_ID;
}
