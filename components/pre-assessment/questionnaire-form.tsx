import { Question } from "@/const/questionnaire";
import { Button } from "../ui/button";
import { motion, useAnimationControls } from "framer-motion";
import { usePreAssessmentChecklistStore } from "./pre-assessment";

export default function QuestionnaireForm({
  questions,
}: {
  questions: Question[];
}) {
  const animationControls = useAnimationControls();

  const { nextStep, step, miniStep, answers, setAnswers } =
    usePreAssessmentChecklistStore();

  const formIndex = step - 1;
  const questionIndex = miniStep;
  const currentAnswer = answers[formIndex][questionIndex];

  const isLastQuestion = questionIndex === questions.length - 1;
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

  function handleButtonOnClick() {
    animationControls
      .start({
        x: -10,
        opacity: 0, // Fade out
        transition: { duration: 0.5, ease: "easeIn" },
      })
      .then(() => {
        nextStep(); // Move to the next question

        animationControls
          .start({
            x: 10, // Start new question from the right
            opacity: 0, // Start invisible
            transition: { duration: 0.5 },
          })
          .then(() => {
            animationControls.start({
              x: 0, // Move new question to the center
              opacity: 1, // Fade in
              transition: { duration: 0.5, ease: "easeOut" },
            });
          });
      });
  }

  return (
    <div>
      <motion.div
        animate={animationControls}
        initial={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
        className="shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8"
      >
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
      </motion.div>

      <div className="bg-white px-10 py-3">
        <Button
          className="w-full font-bold"
          variant={"secondary"}
          onClick={handleButtonOnClick}
        >
          {isLastQuestion ? "Next Form" : "Next"}
        </Button>
      </div>
    </div>
  );
}
