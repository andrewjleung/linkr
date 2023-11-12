import { Card, CardHeader } from "./ui/card";

export function LinksSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Card
            key={`link-skeleton-${i}`}
            className="w-full ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-safe:animate-pulse dark:ring-offset-neutral-950"
          >
            <CardHeader>
              <div className="h-[1.25rem] w-full"></div>
            </CardHeader>
          </Card>
        ))}
    </div>
  );
}
