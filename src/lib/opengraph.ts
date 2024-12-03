import "server-only";

import type { links as linksSchema } from "@/database/schema";
import { kv } from "@vercel/kv";
import ogs, { type SuccessResult } from "open-graph-scraper";

type Og = Pick<
  SuccessResult["result"],
  "ogTitle" | "ogDescription" | "favicon"
>;

type Link = typeof linksSchema.$inferSelect;

type MaybeOg = { success: true; og: Og } | { success: false };

function zipMap<T, R>(ts: T[], fn: (t: T, i: number) => R): [T, R][] {
  return ts.map((t, i) => [t, fn(t, i)]);
}

async function hoistPromise<L, R>(pair: [L, Promise<R>]): Promise<[L, R]> {
  return [pair[0], await pair[1]];
}

function zipMapAsync<T, R>(
  ts: T[],
  fn: (t: T, i: number) => Promise<R>,
): Promise<PromiseSettledResult<[T, R]>[]> {
  return Promise.allSettled(zipMap(ts, fn).map(hoistPromise));
}

export function cacheKey(id: number): string {
  return `linkr-link-og-${id}`;
}

export async function getOgs(links: Link[]): Promise<[number, Og][]> {
  const cachedOgs = await kv.mget<MaybeOg[]>(links.map((l) => cacheKey(l.id)));

  const linksAndResults = await zipMapAsync(
    links,
    async (link, i): Promise<MaybeOg> => {
      const cached = cachedOgs[i];

      if (cached !== null) {
        return cached;
      }

      const result = await ogs({ url: link.url });

      if (result.error) {
        await kv.set(
          cacheKey(link.id),
          { success: false },
          { ex: 60 * 60 * 24 },
        );
        return { success: false };
      }

      const maybeOg = {
        success: true,
        og: {
          ogTitle: result.result.ogTitle,
          ogDescription: result.result.ogDescription,
          favicon: result.result.favicon,
        },
      };

      await kv.set(cacheKey(link.id), maybeOg, { ex: 60 * 60 * 24 });

      return maybeOg;
    },
  );

  const linksAndOgResults = linksAndResults.reduce(
    (acc: [number, Og][], result: PromiseSettledResult<[Link, MaybeOg]>) => {
      if (result.status === "rejected") {
        return acc;
      }

      const [link, maybeOg] = result.value;

      if (!maybeOg.success) {
        return acc;
      }

      return acc.concat([[link.id, maybeOg.og]]);
    },
    [],
  );

  return linksAndOgResults;
}
