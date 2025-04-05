"use client";

import PreAssessmentNavbar from "@/components/pre-assessment/navbar";
import PreAssessmentChecklist from "@/components/pre-assessment/pre-assessment";
import { motion } from "framer-motion";

export default function PreAssessmentPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeIn" }}
      className="bg-gradient-to-b from-tertiary to-transparent w-full h-full"
    >
      <PreAssessmentNavbar />

      <main className="flex flex-col items-center justify-center ">
        <PreAssessmentChecklist />
      </main>
    </motion.div>
  );
}
