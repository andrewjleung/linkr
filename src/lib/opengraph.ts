import "server-only";

import { kv } from "@vercel/kv";
import ogs, { type ErrorResult, type SuccessResult } from "open-graph-scraper";

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

function cacheKey(url: string): string {
	return `linkr-url-${url}`;
}

export async function getOgs(
	urls: string[],
): Promise<[string, SuccessResult["result"]][]> {
	const origins = urls.map((url) => new URL(url).origin);
	const uniqueOrigins = Array.from(new Set(origins));

	const cachedOgs = await kv.mget<ReturnType<typeof ogs>[]>(
		uniqueOrigins.map((o) => cacheKey(o)),
	);

	const originsAndResults = await zipMapAsync(
		uniqueOrigins,
		async (origin, i): ReturnType<typeof ogs> => {
			const cached = cachedOgs[i];

			if (cached !== null) {
				return cached;
			}

			const result = await ogs({ url: origin });
			await kv.set(cacheKey(origin), result, { ex: 60 * 60 * 24 });

			return result;
		},
	);

	const originsAndOgResults = originsAndResults.reduce(
		(
			acc: [string, SuccessResult["result"]][],
			result: PromiseSettledResult<[string, SuccessResult | ErrorResult]>,
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
		[],
	);

	return originsAndOgResults;
}
