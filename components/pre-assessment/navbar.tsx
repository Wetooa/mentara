import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePreAssessmentChecklistStore } from "./pre-assessment";

export default function PreAssessmentNavbar() {
  const { prevStep } = usePreAssessmentChecklistStore();

  return (
    <nav className="flex justify-between p-4">
      <Button
        onClick={prevStep}
        className="rounded-full aspect-square font-bold"
      >
        <ArrowLeft />
      </Button>
      <Logo />
    </nav>
  );
}
