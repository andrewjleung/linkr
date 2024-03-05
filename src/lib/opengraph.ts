import "server-only";

import { Link } from "@/database/types";
import ogs, { ErrorResult, SuccessResult } from "open-graph-scraper";
import { OgObject } from "open-graph-scraper/dist/lib/types";
import { z } from "zod";

function zipMap<T, R>(ts: T[], fn: (t: T) => R): [T, R][] {
  return ts.map((t) => [t, fn(t)]);
}

async function hoistPromise<L, R>(pair: [L, Promise<R>]): Promise<[L, R]> {
  return [pair[0], await pair[1]];
}

function zipMapAsync<T, R>(
  ts: T[],
  fn: (t: T) => Promise<R>
): Promise<PromiseSettledResult<[T, R]>[]> {
  return Promise.allSettled(zipMap(ts, fn).map(hoistPromise));
}

export async function getOgs(links: Link[]): Promise<[string, OgObject][]> {
  const origins = links.map((l) => new URL(l.url).origin);
  const uniqueOrigins = Array.from(new Set(origins));

  const originsAndResults = await zipMapAsync(uniqueOrigins, (origin) =>
    ogs({ url: origin })
  );

  const originsAndOgResults = originsAndResults.reduce(
    (
      acc: [string, OgObject][],
      result: PromiseSettledResult<[string, SuccessResult | ErrorResult]>
    ) => {
      if (result.status === "rejected") {
        return acc;
      }

      const [origin, ogResult] = result.value;

      if (ogResult.error) {
        return acc;
      }

      return acc.concat([[origin, ogResult.result]]);
    },
    []
  );

  return originsAndOgResults;
}
