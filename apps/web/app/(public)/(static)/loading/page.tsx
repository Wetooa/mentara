"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { MentaraLogo } from "@/components/common/MentaraLogo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function LoadingPage() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(var(--primary) / 0.2) 0%, oklch(var(--background)) 40%, oklch(var(--tertiary) / 0.15) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-grid-black/[0.015] bg-[size:60px_60px]" />

      <motion.div
        className="absolute -top-40 -right-40 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(var(--primary) / 0.15), oklch(var(--primary) / 0.05))",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-40 -left-40 w-72 h-72 sm:w-[30rem] sm:h-[30rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(var(--tertiary) / 0.2), oklch(var(--community-warm) / 0.1))",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${18 + i * 16}%`,
            top: `${28 + i * 12}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container px-4 sm:px-6 mx-auto relative z-10 max-w-lg text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Preparing your experience
          </Badge>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
          aria-hidden
        >
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <MentaraLogo
              variant="icon"
              href={undefined}
              showGradient={false}
              width={64}
              height={64}
              className="inline-block"
            />
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-bold text-secondary mb-4 leading-tight"
        >
          Finding your{" "}
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            match
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-muted-foreground text-base sm:text-lg mb-8 max-w-sm mx-auto"
        >
          We&apos;re preparing a personalized experience for you.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex justify-center"
          aria-label="Loading"
        >
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </motion.div>
      </motion.div>
    </section>
  );
}
