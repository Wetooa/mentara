import { QuestionnaireProps, QUESTIONNAIRE_SCORING } from "../scoring";

const PERCEIVED_STRESS_SCALE: any = {
  title: "Perceived Stress Scale",
  description:
    "The Perceived Stress Scale (PSS) is a classic stress assessment instrument designed to measure individual stress levels over the past month. Answer each question based on how often you experienced the described feelings or thoughts.",
  questions: [
    {
      prefix: "In the last month",
      question:
        "In the last month, how often have you been upset because of something that happened unexpectedly?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question:
        "In the last month, how often have you felt that you were unable to control the important things in your life?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question: "In the last month, how often have you felt nervous and stressed?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question:
        "In the last month, how often have you felt confident about your ability to handle your personal problems?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question: "In the last month, how often have you felt that things were going your way?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question:
        "In the last month, how often have you found that you could not cope with all the things that you had to do?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question:
        "In the last month, how often have you been able to control irritations in your life?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question: "In the last month, how often have you felt that you were on top of things?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question:
        "In the last month, how often have you been angered because of things that happened that were outside of your control?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
    {
      prefix: "In the last month",
      question:
        "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
      options: ["never", "almost never", "sometimes", "fairly often", "very often"],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,

    reverseScoredQuestions: [3, 4, 6, 7],
    scoreMapping: { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0 },
    reversedScoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      low: { range: [0, 13], label: "Low" },
      moderate: { range: [14, 26], label: "Moderate" },
      high: { range: [27, 40], label: "High" },
    },
    getScore: (answers: number[]): number => {
      return answers.reduce((total, answer, index) => {
        const isReversed =
          PERCEIVED_STRESS_SCALE.scoring.reverseScoredQuestions.includes(index);

        const score = isReversed
          ? PERCEIVED_STRESS_SCALE.scoring.scoreMapping[answer]
          : PERCEIVED_STRESS_SCALE.scoring.reversedScoreMapping[answer];

        return total + (score ?? 0);
      }, 0);
    },
  },
  disclaimer:
    "The scores from this assessment do not represent a medical diagnosis. They are meant as a tool to help evaluate your stress level. If you have concerns about your well-being, please seek professional help.",
};

export default PERCEIVED_STRESS_SCALE;
