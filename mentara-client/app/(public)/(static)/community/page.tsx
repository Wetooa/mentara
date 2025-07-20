"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-white flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center gap-6"
      >
        <Logo />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-secondary text-center"
        >
          Mentara Community
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-md text-gray-700 text-center"
        >
          Welcome to the Mentara Community! 🌱
          <br />
          Connect, share, and grow with others on their mental health journey.
          Our community is a safe, supportive space for open discussion, peer
          support, and learning from one another.
        </motion.p>
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="list-disc list-inside text-left text-gray-600 space-y-2"
        >
          <li>🤝 Find support groups for your unique needs</li>
          <li>
            💬 Join conversations about mental wellness, self-care, and growth
          </li>
          <li>🎉 Participate in community events and workshops</li>
          <li>🔒 Safe, moderated, and inclusive for all</li>
        </motion.ul>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col md:flex-row gap-4 mt-6 w-full justify-center"
        >
          <Link
            href="/sign-in"
            className={
              buttonVariants({ variant: "default" }) + " w-full md:w-auto"
            }
          >
            Join the Community
          </Link>
          <Link
            href="/about"
            className={
              buttonVariants({ variant: "outline" }) + " w-full md:w-auto"
            }
          >
            Learn More
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
