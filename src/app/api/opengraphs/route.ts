import { getOgs } from "@/lib/opengraph";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const OpengraphGetRequestSchema = z.nullable(z.string().url());

export async function GET(request: NextRequest) {
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
