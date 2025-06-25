"use client";
import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";

export default function SignUpPage() {
  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <SignUp />
    </motion.div>
  );
}
