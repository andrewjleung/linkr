import { withUnkey } from "@unkey/nextjs";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";
import z from "zod/v4";
import { db } from "@/database/database";
import { collections, links } from "@/database/schema";
import { env } from "@/env";
import { revalidatePath } from "next/cache";

// TODO: DRY this up...
const ORDER_BUFFER = 100;

const linkSchema = z.object({
  description: z.optional(z.string()),
  parentCollectionId: z.optional(z.number()),
  title: z.optional(z.string().trim()),
  url: z.url(),
});

export const POST = withUnkey(
  async (req) => {
    const body = await req.json();
    const maybeLink = linkSchema.safeParse(body);

    if (maybeLink.error) {
      return new Response("Bad request", { status: 400 });
    }

    const link = maybeLink.data;

    if (link.parentCollectionId !== undefined) {
      const collectionExists = await db
        .select()
        .from(collections)
        .where(
          and(
            eq(collections.deleted, false),
            eq(collections.id, link.parentCollectionId),
          ),
        )
        .limit(1)
        .then((result) => result.length > 0);

      if (!collectionExists) {
        return new Response("Collection does not exist or is deleted", {
          status: 422,
        });
      }
    }

    const lastLinkInCollection = await db.query.links.findFirst({
      where:
        link.parentCollectionId === undefined
          ? isNull(links.parentCollectionId)
          : eq(links.parentCollectionId, link.parentCollectionId),
      orderBy: desc(links.order),
    });

    const order =
      lastLinkInCollection === undefined
        ? ORDER_BUFFER
        : lastLinkInCollection.order + ORDER_BUFFER;

    const result = await db
      .insert(links)
      .values({ ...link, order })
      .returning();

    revalidatePath(`/collections/${link.parentCollectionId || "home"}`);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
  },
);
