"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button, buttonVariants } from "@/components/ui/button";
import { login } from "./actions";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClickLogin = async () => {
    setLoading(true);
    const { error } = await login();

    if (error) {
      setLoading(false);
      toast.error(error);
    }
  };

  return (
    <AuroraBackground className="z-0">
      <AnimatePresence>
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-screen flex flex-col items-center justify-center lg:min-h-[600px] xl:min-h-[800px] z-10 relative"
        >
          <div className="flex items-center justify-center">
            <div className="mx-auto grid w-[350px] gap-6 z-10">
              <div className="grid gap-2 text-center">
                <h1
                  className={clsx("text-3xl font-bold", {
                    "animate-fade-out": loading,
                  })}
                >
                  Welcome to linkr 👋
                </h1>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Button
                    onClick={onClickLogin}
                    className={clsx("w-full hover:cursor-pointer", {
                      "animate-pulse": loading,
                    })}
                  >
                    {loading ? "Logging you in..." : "Login with GitHub"}
                  </Button>
                </div>
              </div>
              <div
                className={clsx("text-center text-sm mt-4", {
                  "animate-fade-out": loading,
                })}
              >
                Login is restricted.
                <Link
                  href="/demo/collections/home"
                  className={clsx(
                    buttonVariants({ variant: "outline" }),
                    "ml-3",
                  )}
                >
                  Try a Demo!
                </Link>
              </div>
            </div>
          </div>
          <footer className="absolute flex justify-center bottom-0 left-0 w-full text-neutral-500 p-6">
            <div className="w-full flex max-w-5xl">
              <Link
                href="https://andrewjleung.me"
                className="text-sm hover:underline"
              >
                Andrew Leung
              </Link>
              <Link
                href="https://github.com/andrewjleung/linkr"
                className="ml-auto text-sm hover:underline"
              >
                GitHub
              </Link>
            </div>
          </footer>
        </motion.div>
      </AnimatePresence>
    </AuroraBackground>
  );
}
