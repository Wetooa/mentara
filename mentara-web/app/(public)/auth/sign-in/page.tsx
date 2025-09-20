"use client";

import { motion } from "framer-motion";
import { UnifiedSignIn } from "@/components/auth/UnifiedSignIn";
import { fadeDown } from "@/lib/animations";

export default function SignInPage() {
  return (
    <main className="flex flex-col items-center justify-center h-full">
      <motion.div
        variants={fadeDown}
        initial="initial"
        animate="animate"
        className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[400px] w-full"
      >
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your personalized mental health platform
            </p>
          </div>
          <UnifiedSignIn />
        </div>
      </motion.div>
    </main>
  );
}
