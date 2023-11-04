"use client";

import LinkComponent from "@/components/link";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimisticLink, OptimisticLinks } from "@/hooks/use-optimistic-links";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function Links({
  optimisticLinks,
  removeOptimisticLink,
}: {
  optimisticLinks: OptimisticLink[];
  removeOptimisticLink: OptimisticLinks["removeOptimisticLink"];
}) {
  return (
    <>
      {optimisticLinks.length > 0 ? (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {optimisticLinks
              .sort((a, b) => a.link.url.localeCompare(b.link.url))
              .map((l, i) => (
                <motion.div
                  key={`link-${i}`}
                  whileHover={{ scale: 1.025 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LinkComponent
                    optimisticLink={l}
                    removeOptimisticLink={removeOptimisticLink}
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <h1 className="text-2xl">There&apos;s nothing here! 🙀</h1>
          <p className="text-xs">
            The world is your oyster. Go find some links!
          </p>
        </div>
      )}
    </>
  );
}

export function LinksSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <motion.div
              key={`link-skeleton-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="w-full ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-safe:animate-pulse dark:ring-offset-neutral-950">
                <CardHeader>
                  <CardDescription>
                    <div className="h-[1.25rem]"></div>
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
