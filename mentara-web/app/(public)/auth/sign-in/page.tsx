"use client";

import { motion } from "framer-motion";
import { UnifiedSignIn } from "@/components/auth/UnifiedSignIn";
import { fadeDown } from "@/lib/animations";

export default function SignInPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-background via-tertiary/5 to-background p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={fadeDown}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <UnifiedSignIn />
      </motion.div>
    </main>
  );
}
