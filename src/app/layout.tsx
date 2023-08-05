import "./globals.css";
import { Inter } from "next/font/google";
import clsx from "clsx";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          inter.className,
          "flex h-screen w-screen items-center justify-center dark:bg-neutral-950"
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
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
