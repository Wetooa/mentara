import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LIST_OF_QUESTIONNAIRES } from "@/constants/questionnaires";
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
        <div className="w-full mb-8 text-center">
          <h4 className="text-lg text-center text-secondary">
            What can we help you with today?
          </h4>
          <p className="text-xs text-black/80">Select all that apply</p>
        </div>

        <div className="w-full flex flex-col gap-2">
          {LIST_OF_QUESTIONNAIRES.map((questionnaire) => {
            const isSelected = isQuestionnaireSelected(questionnaire.id);
            const handleSelect = () => handleSelectQuestionnaire(questionnaire.id);

            return (
              <div
                onClick={handleSelect}
                key={questionnaire.id}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start px-6 gap-4"
                )}
              >
                <Checkbox onClick={handleSelect} checked={isSelected} />
                <label>{questionnaire.name}</label>
              </div>
            );
          })}
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
