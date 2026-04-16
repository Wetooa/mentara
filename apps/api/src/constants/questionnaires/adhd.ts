import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const ASRS_V1_1: QuestionnaireProps = {
  title: "Adult ADHD Self-Report Scale v1.1",
  description:
    "The Adult ADHD Self-Report Scale (ASRS v1.1) is a self-administered questionnaire used to screen for ADHD symptoms in adults over the past 6 months. It assesses inattentiveness, hyperactivity, and impulsivity based on DSM-5 criteria.",

  questions: [
    {
      prefix: "Daily Tasks",
      question:
        "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Organization",
      question:
        "How often do you have difficulty getting things in order when you have to do a task that requires organisation?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Memory",
      question:
        "How often do you have problems remembering appointments or obligations?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Task Initiation",
      question:
        "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Motor Activity",
      question:
        "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Hyperactivity",
      question:
        "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Attention to Detail",
      question:
        "How often do you make careless mistakes when you have to work on a boring or difficult project?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Sustained Attention",
      question:
        "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Listening",
      question:
        "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Organization",
      question:
        "How often do you misplace or have difficulty finding things at home or at work?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Distractibility",
      question: "How often are you distracted by activity or noise around you?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Restlessness",
      question:
        "How often do you leave your seat in meetings or other situations in which you are expected to remain seated?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Inner Restlessness",
      question: "How often do you feel restless or fidgety?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Relaxation",
      question:
        "How often do you have difficulty unwinding and relaxing when you have time to yourself?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Social Interaction",
      question:
        "How often do you find yourself talking too much when you are in social situations?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Impulsivity",
      question:
        "When you’re in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Patience",
      question:
        "How often do you have difficulty waiting your turn in situations when turn taking is required?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
    {
      prefix: "Social Boundaries",
      question: "How often do you interrupt others when they are busy?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    },
  ],

  scoring: {
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      low: { range: [0, 30], label: "Low" },
      mildToModerate: { range: [31, 39], label: "Mild to Moderate" },
      high: { range: [40, 49], label: "High" },
      veryHigh: { range: [50, 72], label: "Very High" },
      screenPositive: { range: [100, 100], label: "Highly Consistent with Adult ADHD (Screen Positive)" },
      screenNegative: { range: [101, 101], label: "Below Clinical Screening Threshold" },
    },
    getInterpretationFromAnswers: (answers: number[]) => {
      const shadedRules: Record<number, number[]> = {
        0: [2, 3, 4], 1: [2, 3, 4], 2: [2, 3, 4],
        3: [3, 4], 4: [3, 4], 5: [3, 4],
      };

      let partAShadedCount = 0;
      for (let i = 0; i < 6; i++) {
        const answer = answers[i];
        if (answer !== undefined && answer !== -1 && shadedRules[i].includes(answer)) {
          partAShadedCount++;
        }
      }

      if (partAShadedCount >= 4) {
        return "Highly Consistent with Adult ADHD (Screen Positive)";
      }

      const totalScore = answers.reduce((sum, val) => sum + (val === -1 ? 0 : val), 0);
      if (totalScore >= 50) return "Very High";
      if (totalScore >= 40) return "High";
      if (totalScore >= 31) return "Mild to Moderate";
      return "Low";
    }
  },

  disclaimer:
    "This questionnaire is a screening tool and does not provide a definitive diagnosis. A clinical evaluation by a healthcare professional is necessary for a formal ADHD diagnosis.",
};

export default ASRS_V1_1;
