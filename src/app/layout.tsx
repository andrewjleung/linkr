import "./globals.css";
import { Inter } from "next/font/google";
import clsx from "clsx";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/prisma";
import { CollectionsView } from "@/components/collections-view";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unoptimisticCollections = await prisma.collection.findMany();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          inter.className,
          "flex items-center justify-center dark:bg-neutral-950"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="h-full w-full">
            <div className="container flex max-w-7xl flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
              <h2 className="text-lg font-semibold">linkr</h2>
              <div className="ml-auto flex w-full space-x-2 sm:justify-end">
                <ThemeToggle />
              </div>
            </div>
            <Separator />
            <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-3 gap-8 p-8">
              <div className="col-span-1">
                <CollectionsView
                  unoptimisticCollections={unoptimisticCollections}
                />
              </div>
              <div className="col-span-2">{children}</div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
