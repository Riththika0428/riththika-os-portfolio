"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Fade-in only. An exit animation (AnimatePresence mode="wait") can leave the next page
// stuck invisible if the old page never finishes leaving, which needs a reload to fix.
export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}