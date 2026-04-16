import { Button } from "@/components/ui/button";
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
    currentRapportQuestion,
    currentRapportChoice,
    handleSelectRapportChoice,
    isSubmitDisabled,
  } = usePreAssessmentChecklist();

  if (!currentRapportQuestion) return null;

  return (
    <>
      <div className="w-full p-6 sm:p-8">
        <div className="w-full mb-8 text-center">
          <h4 className="text-3xl font-bold text-gray-900 mb-3">
            {currentRapportQuestion.title}
          </h4>
          <p className="text-base text-gray-600">Select the option that best resonates with you right now</p>
        </div>

        {/* Scrollable checklist with max height */}
        <div className="w-full max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-3">
            {currentRapportQuestion.choices.map((choice, index) => {
              const isSelected = currentRapportChoice === index;

              return (
                <button
                  onClick={() => handleSelectRapportChoice(index)}
                  key={index}
                  className={cn(
                    "flex flex-col items-start justify-center px-6 py-4 gap-2 bg-white hover:bg-primary/5 border-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-gray-200 hover:border-primary"
                  )}
                >
                  <span className="text-gray-900 font-medium text-base">
                    {choice.text}
                  </span>
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
