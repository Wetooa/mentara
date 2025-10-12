import { Button } from "@/components/ui/button";
import { usePreAssessmentQuestionnaire } from "@/hooks/pre-assessment/usePreAssessmentQuestionnaire";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading question...</p>
          </div>
        </div>
        <div className="bg-white px-10 py-3">
          <Button
            className="w-full font-bold"
            variant={"secondary"}
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
        <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>
                Failed to load questionnaire. Please try again later.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <div className="bg-white px-10 py-3">
          <Button
            className="w-full font-bold"
            variant={"secondary"}
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
        <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              No question available at this step.
            </p>
          </div>
        </div>
        <div className="bg-white px-10 py-3">
          <Button
            className="w-full font-bold"
            variant={"secondary"}
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
      <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
        <div className="mb-8 text-center">
          <p className="text-xs text-black/80">{question.prefix}</p>
          <p className="text-lg text-center text-secondary">
            {question.question}
          </p>
        </div>
        <div className="w-full flex flex-col gap-3">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            return (
              <Button
                variant={isSelected ? "default" : "outline"}
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={
                  isSelected
                    ? ""
                    : "bg-white hover:bg-primary/10 hover:border-primary/50 hover:text-primary border-2"
                }
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="bg-white px-10 py-3">
        <Button
          className="w-full font-bold"
          variant={"secondary"}
          disabled={isAnswerDisabled}
          onClick={handleNextButtonOnClick}
        >
          {buttonText}
        </Button>
      </div>
    </>
  );
}
