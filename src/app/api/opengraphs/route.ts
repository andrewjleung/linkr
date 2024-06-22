import { env } from "@/app/env.mjs";
import { getOgs } from "@/lib/opengraph";
import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const OpengraphGetRequestSchema = z.nullable(z.string().url());

async function loggedIn(): Promise<boolean> {
	const client = createClient();

	const {
		data: { user },
		error,
	} = await client.auth.getUser();

	return error === null && user !== null && user.id === env.NEXT_PUBLIC_USER_ID;
}

export async function GET(request: NextRequest) {
	const li = await loggedIn();
	if (!li) {
		return Response.error();
	}

	const searchParams = request.nextUrl.searchParams;
	const url = OpengraphGetRequestSchema.parse(searchParams.get("url"));

	if (url === null) {
		return Response.error();
	}

	const ogs = await getOgs([url]);

	if (ogs.length !== 1) {
		return Response.error();
	}

	return Response.json({ data: ogs[0][1] });
}
