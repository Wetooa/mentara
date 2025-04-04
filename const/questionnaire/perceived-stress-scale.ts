export const PERCEIVED_STRESS_SCALE = {
  title: "Perceived Stress Scale",
  description:
    "The Perceived Stress Scale (PSS) is a classic stress assessment instrument designed to measure individual stress levels over the past month. Answer each question based on how often you experienced the described feelings or thoughts.",
  options: {
    0: "Never",
    1: "Almost never",
    2: "Sometimes",
    3: "Fairly often",
    4: "Very often",
  },
  questions: [
    "In the last month, how often have you been upset because of something that happened unexpectedly?",
    "In the last month, how often have you felt that you were unable to control the important things in your life?",
    "In the last month, how often have you felt nervous and stressed?",
    "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    "In the last month, how often have you felt that things were going your way?",
    "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    "In the last month, how often have you been able to control irritations in your life?",
    "In the last month, how often have you felt that you were on top of things?",
    "In the last month, how often have you been angered because of things that happened that were outside of your control?",
    "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
  ],
  scoring: {
    reverseScoredQuestions: [3, 4, 6, 7],
    scoreMapping: { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0 },
    stressLevels: {
      low: { range: [0, 13], label: "Low Stress" },
      moderate: { range: [14, 26], label: "Moderate Stress" },
      high: { range: [27, 40], label: "High Perceived Stress" },
    },
  },
  disclaimer:
    "The scores from this assessment do not represent a medical diagnosis. They are meant as a tool to help evaluate your stress level. If you have concerns about your well-being, please seek professional help.",
};

export default PERCEIVED_STRESS_SCALE;
