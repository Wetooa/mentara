import {
  type ListOfQuestionnaires,
  QUESTIONNAIRE_MAP,
} from "@/constants/questionnaire/questionnaire-mapping";

export function answersToAnswerMatrix(
  questionnaires: ListOfQuestionnaires[],
  flatAnswers: number[]
) {
  const result = Array(201).fill(0);

  // Get the starting indices for each questionnaire (ML Model expected positions)
  const startIndices: Record<ListOfQuestionnaires, number> = {
    Stress: 174, // PSS
    Anxiety: 69, // GAD7
    Depression: 165, // PHQ9
    "Drug Abuse": 24, // DAST
    Insomnia: 76, // ISI
    Panic: 158, // PDSS
    "Bipolar disorder (BD)": 105, // MDQ
    "Obsessive compulsive disorder (OCD)": 120, // OCI_R
    "Post-traumatic stress disorder (PTSD)": 138, // PCL5
    "Social anxiety": 184, // SPIN
    Phobia: 0, // PHQ
    Burnout: 83, // MBI
    "Binge eating / Eating disorders": 43, // BES
    "ADD / ADHD": 15, // ASRS
    "Substance or Alcohol Use Issues": 33, // AUDIT
  };

  let flatIndexTracker = 0;

  // Loop through the questionnaires and fill in the answers from the 1D flat array sequentially
  for (let i = 0; i < questionnaires.length; i++) {
    const q = questionnaires[i];
    const startIndex = startIndices[q];
    const questionCount = QUESTIONNAIRE_MAP[q].questions.length;

    // Fill answers for this specific questionnaire by reading the next N answers from the flat array
    for (let j = 0; j < questionCount; j++) {
      if (flatIndexTracker < flatAnswers.length) {
        result[startIndex + j] = flatAnswers[flatIndexTracker];
      }
      flatIndexTracker++;
    }
  }

  return result;
}
