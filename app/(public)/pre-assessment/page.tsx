import Logo from "@/components/logo";
import PreAssessmentChecklist from "@/components/pre-assessment/checklist";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PreAssessmentPage() {
  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full h-full">
      <nav className="flex justify-between p-4">
        <Button className="rounded-full aspect-square font-bold">
          <ArrowLeft />
        </Button>
        <Logo />
      </nav>

      <main className="flex flex-col items-center justify-center ">
        <PreAssessmentChecklist />
      </main>
    </div>
  );
}
