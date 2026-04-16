// Questionnaire mapping and utility functions
// This file provides a centralized mapping between questionnaire names and objects

import ADHD_ASRS from "./adhd";
import ALCOHOL_AUDIT from "./alcohol";
import BINGE_EATING_BES from "./binge-eating";
import BURNOUT_MBI from "./burnout";
import DRUG_ABUSE_DAST from "./drug-abuse";
import ANXIETY_GAD7 from "./gad-7-anxiety";
import INSOMNIA_ISI from "./insomnia";
import MOOD_DISORDER_MDQ from "./mood-disorder";
import OCD_OCI_R from "./obsessional-compulsive";
import PANIC_DISORDER_PDSS from "./panic-disorder";
import STRESS_PSS from "./perceived-stress-scale";
import PHOBIA_SPECIFIC from "./phobia";
import DEPRESSION_PHQ9 from "./phq-9";
import PTSD_PCL5 from "./ptsd";
import SOCIAL_PHOBIA_SPIN from "./social-phobia";
import { QuestionnaireProps } from "../scoring";

// List of questionnaire display names for UI components
export const LIST_OF_QUESTIONNAIRES = [
  "Stress",
  "Anxiety",
  "Depression",
  "Drug Abuse",
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
] as const;

export type ListOfQuestionnaires = (typeof LIST_OF_QUESTIONNAIRES)[number];

// Mapping from display names to questionnaire objects
export const QUESTIONNAIRE_MAP: Record<
  ListOfQuestionnaires,
  QuestionnaireProps
> = {
  Stress: STRESS_PSS,
  Anxiety: ANXIETY_GAD7,
  Depression: DEPRESSION_PHQ9,
  "Drug Abuse": DRUG_ABUSE_DAST,
  Insomnia: INSOMNIA_ISI,
  Panic: PANIC_DISORDER_PDSS,
  "Bipolar disorder (BD)": MOOD_DISORDER_MDQ,
  "Obsessive compulsive disorder (OCD)": OCD_OCI_R,
  "Post-traumatic stress disorder (PTSD)": PTSD_PCL5,
  "Social anxiety": SOCIAL_PHOBIA_SPIN,
  Phobia: PHOBIA_SPECIFIC,
  Burnout: BURNOUT_MBI,
  "Binge eating / Eating disorders": BINGE_EATING_BES,
  "ADD / ADHD": ADHD_ASRS,
  "Substance or Alcohol Use Issues": ALCOHOL_AUDIT,
};

// Reverse mapping from questionnaire IDs to display names
export const QUESTIONNAIRE_ID_TO_NAME_MAP: Record<
  string,
  ListOfQuestionnaires
> = {
  adhd: "ADD / ADHD",
  alcohol: "Substance or Alcohol Use Issues",
  "binge-eating": "Binge eating / Eating disorders",
  burnout: "Burnout",
  "drug-abuse": "Drug Abuse",
  anxiety: "Anxiety",
  insomnia: "Insomnia",
  "mood-disorder": "Bipolar disorder (BD)",
  "obsessional-compulsive": "Obsessive compulsive disorder (OCD)",
  "panic-disorder": "Panic",
  stress: "Stress",
  phobia: "Phobia",
  depression: "Depression",
  ptsd: "Post-traumatic stress disorder (PTSD)",
  "social-phobia": "Social anxiety",
};

// Helper function to get questionnaire by display name
export const getQuestionnaireByName = (
  name: ListOfQuestionnaires
): QuestionnaireProps => {
  return QUESTIONNAIRE_MAP[name];
};

// Helper function to get all questionnaire names
export const getAllQuestionnaireNames = (): readonly ListOfQuestionnaires[] => {
  return LIST_OF_QUESTIONNAIRES;
};

// Helper function to get questionnaire by ID
export const getQuestionnaireById = (id: string): QuestionnaireProps | null => {
  const displayName = QUESTIONNAIRE_ID_TO_NAME_MAP[id];
  return displayName ? QUESTIONNAIRE_MAP[displayName] : null;
};

// Helper function to validate if a questionnaire name exists
export const isValidQuestionnaireName = (
  name: string
): name is ListOfQuestionnaires => {
  return LIST_OF_QUESTIONNAIRES.includes(name as ListOfQuestionnaires);
};
