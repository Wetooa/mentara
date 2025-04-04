"use client";

import Logo from "@/components/logo";
import PreAssessmentChecklist from "@/components/pre-assessment/checklist";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PreAssessmentPage() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeIn" }}
        className="bg-gradient-to-b from-tertiary to-transparent w-full h-full"
      >
        <nav className="flex justify-between p-4">
          <Button className="rounded-full aspect-square font-bold">
            <ArrowLeft />
          </Button>
          <Logo />
        </nav>

        <main className="flex flex-col items-center justify-center ">
          <PreAssessmentChecklist />
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
