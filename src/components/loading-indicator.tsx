import { AnimatePresence } from "framer-motion";

export default function LoadingIndicator() {
  return (
    <AnimatePresence>
      <div className="flex items-center justify-center">
        <div className="h-3 w-3 animate-pulse rounded-full bg-orange-400 blur-sm dark:bg-orange-500" />
        <div className="absolute h-2 w-2 animate-pulse rounded-full bg-orange-400 dark:bg-orange-500" />
      </div>
    </AnimatePresence>
  );
}
