"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import { MentaraLogo } from "@/components/common/MentaraLogo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DemoSplashPage() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 max-w-md mx-auto"
      style={{
        background:
          "linear-gradient(135deg, oklch(var(--primary) / 0.12) 0%, oklch(var(--background)) 50%, oklch(var(--tertiary) / 0.1) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:40px_40px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="mb-8">
          <MentaraLogo
            variant="icon"
            href={undefined}
            showGradient={false}
            width={80}
            height={80}
            className="inline-block"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl sm:text-2xl font-medium text-secondary mb-8 leading-relaxed"
        >
          Connecting Filipinos to the right therapist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link href="/pre-assessment/chat?demo=1">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg"
            >
              Talk to Mentara
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
