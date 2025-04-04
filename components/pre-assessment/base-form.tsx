import { motion } from "framer-motion";
import { usePreAssessmentChecklistStore } from "./preassessment";
import PreAssessmentInitialCheckList from "./checklist-initial";
import { ListOfQuestionnaires } from "@/const/list-of-questionnaires";
import StressForm from "./questionnaire/stress";

export default function PreAssessmentBaseForm() {
  const { step, questionnaires } = usePreAssessmentChecklistStore();

  const QUESTIONNAIRE_MAP: Record<ListOfQuestionnaires, React.ReactNode> = {
    Stress: <StressForm />,
  };

  let form = null;

  if (step === 0) {
    form = <PreAssessmentInitialCheckList />;
  } else {
    form = QUESTIONNAIRE_MAP[questionnaires[step - 1]] || null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeIn" }}
    >
      {form}
    </motion.div>
  );
}
