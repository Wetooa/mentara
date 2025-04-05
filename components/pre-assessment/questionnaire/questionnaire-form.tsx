import { Button } from "@/components/ui/button";
import { Question } from "@/const/questionnaire";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";

export default function QuestionnaireForm({
  questions,
}: {
  questions: Question[];
}) {
  const { step, miniStep, answers, setAnswers } =
    usePreAssessmentChecklistStore();

  const formIndex = step - 1;
  const questionIndex = miniStep;
  const currentAnswer = answers[formIndex][questionIndex];

  const question = questions[questionIndex];

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
      <div className="mb-8 text-center">
        <p className="text-xs text-black/80">{question.prefix}</p>
        <p className="text-lg text-center text-secondary">
          {question.question}
        </p>
      </div>
      <div className="flex flex-col gap-2">
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
    </>
  );
}
