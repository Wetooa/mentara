import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { motion } from "framer-motion";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";
import { useEffect } from "react";

export default function PreAssessmentNavbar() {
  const { step, prevStep, isPrevDisabled, setPrevDisabled } =
    usePreAssessmentChecklistStore();

  useEffect(() => {
    if (step === 0) {
      setPrevDisabled(true);
    } else {
      setPrevDisabled(false);
    }
  }, [setPrevDisabled, step]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeIn" }}
      className="flex justify-between p-4 fixed w-full"
    >
      <Button
        disabled={isPrevDisabled}
        onClick={prevStep}
        className="rounded-full aspect-square font-bold"
      >
        <ArrowLeft />
      </Button>

      <Logo />
    </motion.nav>
  );
}
