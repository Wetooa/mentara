import ASRS_V1_1 from "./questionnaire/adhd";
import AUDIT from "./questionnaire/alcohol";
import BES from "./questionnaire/binge-eating";
import MBI from "./questionnaire/burnout";
import GAD_7_ANXIETY from "./questionnaire/gad-7-anxiety";
import INSOMNIA_SURVEY from "./questionnaire/insomnia";
import MDQ from "./questionnaire/mood-disorder";
import OCI_R from "./questionnaire/obsessional-compulsive";
import PDSS from "./questionnaire/panic-disorder";
import PERCEIVED_STRESS_SCALE from "./questionnaire/perceived-stress-scale";
import PHQ from "./questionnaire/phobia";
import PHQ_9 from "./questionnaire/phq-9";
import PCL_5 from "./questionnaire/ptsd";
import SPIN from "./questionnaire/social-phobia";

export const LIST_OF_QUESTIONNAIRES = [
  "Stress",
  "Anxiety",
  "Depression",
  "Insomnia",
  "Panic",
  "Bipolar disorder (BD)",
  "Obsessive compulsive disorder (OCD)",
  "Post-traumatic stress disorder (PTSD)",
  "Social anxiety",
  "Phobia",
  "Burnout",
  "Binge eating / Eating disorders",
  "ADD / ADHD",
  "Substance or Alcohol Use Issues",
];

export type ListOfQuestionnaires = (typeof LIST_OF_QUESTIONNAIRES)[number];

export const QUESTIONNAIRE_MAP: Record<ListOfQuestionnaires, unknown> = {
  Stress: PERCEIVED_STRESS_SCALE,
  Anxiety: GAD_7_ANXIETY,
  Depression: PHQ_9,
  Insomia: INSOMNIA_SURVEY,
  Panic: PDSS,
  "Bipolar disorder (BD)": MDQ,
  "Obsessive compulsive disorder (OCD)": OCI_R,
  "Post-traumatic stress disorder (PTSD)": PCL_5,
  "Social anxiety": SPIN,
  Phobia: PHQ,
  Burnout: MBI,
  "Binge eating / Eating disorders": BES,
  "ADD / ADHD": ASRS_V1_1,
  "Substance or Alcohol Use Issues": AUDIT,
};
