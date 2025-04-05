import { Button } from "@/components/ui/button";
import { Question } from "@/const/questionnaire";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";
import { useEffect } from "react";

export default function QuestionnaireForm({
  questions,
}: {
  questions: Question[];
}) {
  const { step, miniStep, answers, setAnswers, setNextDisabled } =
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

  useEffect(() => {
    if (currentAnswer === undefined) {
      setNextDisabled(true);
    } else {
      setNextDisabled(false);
    }
  }, [currentAnswer, setNextDisabled]);

  return (
    <>
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
    </>
  );
}
