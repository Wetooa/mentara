import { Button } from "@/components/ui/button";
import { usePreAssessmentQuestionnaire } from "@/hooks/pre-assessment/usePreAssessmentQuestionnaire";

interface QuestionnaireFormProps {
  handleNextButtonOnClick: () => void;
}

export default function QuestionnaireForm({
  handleNextButtonOnClick,
}: QuestionnaireFormProps) {
  const {
    question,
    currentAnswer,
    handleSelectAnswer,
    isAnswerDisabled,
    buttonText,
  } = usePreAssessmentQuestionnaire();

  return (
    <>
      <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
        <div className="mb-8 text-center">
          <p className="text-xs text-black/80">{question.prefix}</p>
          <p className="text-lg text-center text-secondary">
            {question.question}
          </p>
        </div>
        <div className="w-full flex flex-col gap-2">
          {question.options.map((option, index) => {
            return (
              <Button
                variant={currentAnswer === index ? "default" : "unclicked"}
                key={index}
                onClick={() => handleSelectAnswer(index)}
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
