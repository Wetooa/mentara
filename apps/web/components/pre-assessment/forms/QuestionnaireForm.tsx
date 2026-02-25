import { Button } from "@/components/ui/button";
import { usePreAssessmentQuestionnaire } from "@/hooks/pre-assessment/usePreAssessmentQuestionnaire";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface QuestionnaireFormProps {
  handleNextButtonOnClick: () => void;
}

export default function QuestionnaireForm({
  handleNextButtonOnClick,
}: QuestionnaireFormProps) {
  const {
    question,
    isLoading,
    error,
    currentAnswer,
    handleSelectAnswer,
    isAnswerDisabled,
    buttonText,
  } = usePreAssessmentQuestionnaire();

  // Show loading state
  if (isLoading) {
    return (
      <>
        <div className="w-full p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-base text-gray-600">Loading question...</p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200">
          <Button
            className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
            disabled={true}
          >
            Loading...
          </Button>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <div className="w-full p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>
                Failed to load questionnaire. Please try again later.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200">
          <Button
            className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
            disabled={true}
          >
            Error
          </Button>
        </div>
      </>
    );
  }

  // Show no question available state
  if (!question) {
    return (
      <>
        <div className="w-full p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
            <p className="text-base text-gray-600 text-center">
              No question available at this step.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200">
          <Button
            className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
            disabled={true}
          >
            Unavailable
          </Button>
        </div>
      </>
    );
  }

  // Show normal question state
  return (
    <>
      <div className="w-full p-6 sm:p-8">
        <div className="mb-10 text-center">
          {question.prefix && (
            <p className="text-base text-gray-600 mb-3">{question.prefix}</p>
          )}
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {question.question}
          </p>
        </div>
        <div className="w-full min-h-[380px] flex flex-col gap-4">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            return (
              <Button
                variant={isSelected ? "default" : "outline"}
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={cn(
                  "w-full h-auto min-h-[52px] py-4 px-6 text-base font-medium transition-all duration-200 whitespace-normal leading-snug",
                  isSelected
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    : "bg-white hover:bg-primary/5 hover:border-primary border-2 border-gray-200 text-gray-900 shadow-sm hover:shadow-md"
                )}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200">
        <Button
          className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
          disabled={isAnswerDisabled}
          onClick={handleNextButtonOnClick}
        >
          {buttonText}
        </Button>
      </div>
    </>
  );
}
