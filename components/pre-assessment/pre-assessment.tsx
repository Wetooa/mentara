import { QUESTIONNAIRE_MAP } from "@/const/list-of-questionnaires";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";
import { motion, useAnimationControls } from "framer-motion";
import { Button } from "../ui/button";
import PreAssessmentProgressBar from "./progress-bar";
import PreAssessmentInitialCheckList from "./questionnaire/initial";
import QuestionnaireForm from "./questionnaire/questionnaire-form";
import SignUp from "./sign-up";

export default function PreAssessmentChecklist() {
  const { step, miniStep, questionnaires, nextStep, isNextDisabled } =
    usePreAssessmentChecklistStore();

  // const QUESTIONNAIRE_MAP: Record<ListOfQuestionnaires, React.ReactNode> = {
  //   Stress: <StressForm />,
  // };

  let form = null;
  if (step === 0) {
    form = <PreAssessmentInitialCheckList />;
  } else if (step < questionnaires.length + 1) {
    const title = questionnaires[step - 1];
    const questionnaire = QUESTIONNAIRE_MAP[title];
    form = <QuestionnaireForm questions={questionnaire.questions} />;
  } else {
    form = <SignUp />;
  }

  const formIndex = step;
  const questionIndex = miniStep;
  const isLastQuestion =
    formIndex === 0 ||
    formIndex === questionnaires.length + 1 ||
    questionnaires[step - 1].length - 1 == questionIndex;

  const animationControls = useAnimationControls();

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeIn" }}
      className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[400px] w-full"
    >
      <PreAssessmentProgressBar />

      <div className="w-full">
        <motion.div
          animate={animationControls}
          initial={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8"
        >
          {form}
        </motion.div>

        <div className="bg-white px-10 py-3">
          <Button
            className="w-full font-bold"
            variant={"secondary"}
            disabled={isNextDisabled}
            onClick={handleButtonOnClick}
          >
            {isLastQuestion ? "Next Form" : "Next"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
