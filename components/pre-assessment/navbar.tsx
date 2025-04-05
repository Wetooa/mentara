import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { motion } from "framer-motion";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";

export default function PreAssessmentNavbar() {
  const { prevStep } = usePreAssessmentChecklistStore();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeIn" }}
      className="flex justify-between p-4 fixed w-full"
    >
      <Button
        onClick={prevStep}
        className="rounded-full aspect-square font-bold"
      >
        <ArrowLeft />
      </Button>

      <Logo />
    </motion.nav>
  );
}
