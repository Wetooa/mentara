import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { usePreAssessmentChecklistStore } from "@/store/preassessment";
import { AnimationControls, motion } from "framer-motion";
import { useEffect } from "react";

export default function PreAssessmentNavbar({
  animationControls,
}: {
  animationControls: AnimationControls;
}) {
  const { step, prevStep, isPrevDisabled, setPrevDisabled } =
    usePreAssessmentChecklistStore();

  useEffect(() => {
    if (step === 0) {
      setPrevDisabled(true);
    } else {
      setPrevDisabled(false);
    }
  }, [setPrevDisabled, step]);

  function handleButtonOnClick() {
    animationControls
      .start({
        x: 10,
        opacity: 0, // Fade out
        transition: { duration: 0.5, ease: "easeIn" },
      })
      .then(() => {
        prevStep(); // Move to the next question

        animationControls
          .start({
            x: -10, // Start new question from the right
            opacity: 0, // Start invisible
            transition: { duration: 0.5 },
          })
          .then(() => {
            animationControls.start({
              x: 0, // Move new question to the center
              opacity: 1, // Fade in
              transition: { duration: 0.5, ease: "easeOut" },
            });
          });
      });
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeIn" }}
      className="flex justify-between p-4 fixed w-full"
    >
      <Button
        disabled={isPrevDisabled}
        onClick={handleButtonOnClick}
        className="rounded-full aspect-square font-bold"
      >
        <ArrowLeft />
      </Button>

      <Logo />
    </motion.nav>
  );
}
