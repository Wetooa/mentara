import {
  type ListOfQuestionnaires,
  QUESTIONNAIRE_MAP,
} from "@/constants/questionnaires";

export function answersToAnswerMatrix(
  questionnaires: ListOfQuestionnaires[],
  answers: number[][]
) {
  const result = Array(201).fill(0);

  // Get the starting indices for each questionnaire
  const startIndices: Record<ListOfQuestionnaires, number> = {
    Stress: 174, // PSS
    Anxiety: 69, // GAD7
    Depression: 165, // PHQ9
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

  // Loop through the questionnaires and fill in the answers
  for (let i = 0; i < questionnaires.length; i++) {
    const q = questionnaires[i];
    const startIndex = startIndices[q];
    const questionCount = QUESTIONNAIRE_MAP[q].questions.length;

    // Fill answers for this questionnaire
    for (let j = 0; j < questionCount; j++) {
      result[startIndex + j] = answers[i][j];
    }
  }

  return result;
}
