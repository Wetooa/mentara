import { PreAssessmentPageFormProps } from "@/app/(public)/(user)/pre-assessment/page";
import { Button } from "@/components/ui/button";
import { QUESTIONNAIRE_MAP } from "@/const/questionnaires";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";

export default function QuestionnaireForm({
  handleNextButtonOnClick,
}: PreAssessmentPageFormProps) {
  const { step, miniStep, questionnaires, answers, setAnswers } =
    usePreAssessmentChecklistStore();

  const formIndex = step - 1;
  const questionIndex = miniStep;

  const questionnaire = questionnaires[formIndex];
  const questions = QUESTIONNAIRE_MAP[questionnaire].questions;
  const question = questions[questionIndex];
  const currentAnswer = answers[formIndex][questionIndex];
  const isLastQuestion = questions.length - 1 === questionIndex;

  function handleSelectAnswer(answer: number) {
    const previousAnswers: number[] = answers[formIndex];
    let formAnswers: number[] = [];

    formAnswers = [
      ...previousAnswers.slice(0, questionIndex),
      answer,
      ...previousAnswers.slice(questionIndex + 1),
    ];

    setAnswers(formIndex, formAnswers);
  }

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
          disabled={currentAnswer === undefined}
          onClick={handleNextButtonOnClick}
        >
          {isLastQuestion ? "Next form..." : "Continue"}
        </Button>
      </div>
    </>
  );
}
