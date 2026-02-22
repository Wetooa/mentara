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
      <div className="w-full p-6 sm:p-8">
        <div className="w-full mb-8 text-center">
          <h4 className="text-3xl font-bold text-gray-900 mb-3">
            What can we help you with today?
          </h4>
          <p className="text-base text-gray-600">Select all that apply</p>
        </div>

        {/* Scrollable checklist with max height */}
        <div className="w-full max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-3">
            {LIST_OF_QUESTIONNAIRES.map((questionnaire) => {
              const isSelected = isQuestionnaireSelected(questionnaire);
              const handleSelect = () =>
                handleSelectQuestionnaire(questionnaire);

              return (
                <button
                  onClick={handleSelect}
                  key={questionnaire}
                  className={cn(
                    "flex items-center justify-start px-6 py-4 gap-4 bg-white hover:bg-primary/5 border-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left",
                    isSelected 
                      ? "border-primary bg-primary/10 shadow-md" 
                      : "border-gray-200 hover:border-primary"
                  )}
                >
                  <Checkbox 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect();
                    }} 
                    checked={isSelected}
                    className="flex-shrink-0"
                  />
                  <label className="cursor-pointer text-gray-900 font-medium text-base flex-1">
                    {questionnaire}
                  </label>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200">
        <Button
          className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
          disabled={isSubmitDisabled}
          onClick={handleNextButtonOnClick}
        >
          Continue
        </Button>
      </div>
    </>
  );
}
