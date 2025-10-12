import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LIST_OF_QUESTIONNAIRES } from "@/constants/questionnaire/questionnaire-mapping";
import { cn } from "@/lib/utils";
import { usePreAssessmentChecklist } from "@/hooks/pre-assessment/usePreAssessmentChecklist";

interface PreAssessmentInitialCheckListProps {
  handleNextButtonOnClick: () => void;
}

export default function PreAssessmentInitialCheckList({
  handleNextButtonOnClick,
}: PreAssessmentInitialCheckListProps) {
  // Use the checklist hook for ALL business logic
  const {
    handleSelectQuestionnaire,
    isQuestionnaireSelected,
    isSubmitDisabled,
  } = usePreAssessmentChecklist();

  return (
    <>
      <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
        <div className="w-full mb-6 text-center">
          <h4 className="text-lg text-center text-secondary">
            What can we help you with today?
          </h4>
          <p className="text-xs text-black/80">Select all that apply</p>
        </div>

        {/* Scrollable checklist with max height */}
        <div className="w-full max-h-[400px] overflow-y-auto pr-2">
          <div className="flex flex-col gap-2">
            {LIST_OF_QUESTIONNAIRES.map((questionnaire) => {
              const isSelected = isQuestionnaireSelected(questionnaire);
              const handleSelect = () =>
                handleSelectQuestionnaire(questionnaire);

              return (
                <div
                  onClick={handleSelect}
                  key={questionnaire}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start px-6 gap-4 bg-white hover:bg-primary/10 hover:border-primary/30",
                    isSelected && "border-primary bg-primary/5"
                  )}
                >
                  <Checkbox onClick={handleSelect} checked={isSelected} />
                  <label className="cursor-pointer">{questionnaire}</label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white px-10 py-3">
        <Button
          className="w-full font-bold"
          variant={"secondary"}
          disabled={isSubmitDisabled}
          onClick={handleNextButtonOnClick}
        >
          Submit
        </Button>
      </div>
    </>
  );
}
