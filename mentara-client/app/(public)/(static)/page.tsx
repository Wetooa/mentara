"use client";
import Logo from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MainPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tertiary/60 via-white to-tertiary/10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-10 flex flex-col items-center text-center"
      >
        <div className="mb-6">
          <Logo />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          Welcome to Mentara
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Your journey to wellness starts here. Continue to explore our platform
          and discover how we can support you.
        </p>
        <Link
          href="/landing"
          className={cn(
            buttonVariants(),
            "bg-tertiary hover:bg-tertiary/90 text-primary font-bold px-8 py-3 rounded-lg text-lg shadow-md transition-all"
          )}
        >
          Continue
        </Link>
      </motion.div>
    </div>
  );
}
