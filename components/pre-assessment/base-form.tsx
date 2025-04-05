import { ListOfQuestionnaires } from "@/const/list-of-questionnaires";
import SignIn from "../sign-up/sign-up";
import PreAssessmentInitialCheckList from "./checklist-initial";
import { usePreAssessmentChecklistStore } from "./pre-assessment";
import StressForm from "./questionnaire/stress";

export default function PreAssessmentBaseForm() {
  const { step, questionnaires } = usePreAssessmentChecklistStore();

  const QUESTIONNAIRE_MAP: Record<ListOfQuestionnaires, React.ReactNode> = {
    Stress: <StressForm />,
  };

  let form = null;

  if (step === 0) {
    form = <PreAssessmentInitialCheckList />;
  } else if (step < questionnaires.length + 1) {
    form = QUESTIONNAIRE_MAP[questionnaires[step - 1]] || null;
  } else {
    form = <SignIn />;
  }

  return form;
}
