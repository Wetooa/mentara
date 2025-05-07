import { QuestionnaireProps } from "../scoring";

const MDQ: {
  scoring: {
    scoreThreshold: number; // Score threshold for questions 1-13
    subscales: Record<string, number[]>;
  } & QuestionnaireProps["scoring"];
} & QuestionnaireProps = {
  title: "Mood Disorder Questionnaire (MDQ)",
  description:
    "The Mood Disorder Questionnaire (MDQ) is a self-administered screening tool used to help assess bipolar disorder. It is designed to evaluate the presence of symptoms of mania or hypomania over a period of time.",
  questions: [
    {
      prefix: "In the past",
      question:
        "have you felt so good or so hyper that other people thought you were not your normal self or you were so hyper that you got into trouble?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question:
        "have you been so irritable that you shouted at people or started fights or arguments?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question: "have you felt much more self-confident than usual?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question:
        "did you get much less sleep than usual and found you didn’t really miss it?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question: "have you been much more talkative or spoke faster than usual?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question:
        "have thoughts raced through your head or you couldn’t slow your mind down?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question:
        "have you been so easily distracted by things around you that you had trouble concentrating or staying on track?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question: "have you had much more energy than usual?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question: "were you much more active or did many more things than usual?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question:
        "were you much more social or outgoing than usual, for example, you telephoned friends in the middle of the night?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question: "were you much more interested in sex than usual?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question:
        "did you do things that were unusual for you or that other people might have thought were excessive, foolish, or risky?",
      options: ["Yes", "No"],
    },
    {
      prefix: "In the past",
      question: "did spending money get you or your family into trouble?",
      options: ["Yes", "No"],
    },
    {
      prefix: "If you answered YES to more than one of the above",
      question:
        "have several of these ever happened during the same period of time?",
      options: ["Yes", "No"],
    },
    {
      prefix: "",
      question:
        "How much of a problem did any of these cause you, such as being unable to work; having family, money, or legal troubles; getting into arguments or fights?",
      options: [
        "No problem",
        "Minor problem",
        "Moderate problem",
        "Serious problem",
      ],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1 },
    scoreThreshold: 7, // Score threshold for questions 1-13
    severityLevels: {
      low: { range: [0, 6], label: "No significant symptoms" },
      moderate: { range: [7, 10], label: "Possible mood disorder" },
      high: { range: [11, 13], label: "High likelihood of bipolar disorder" },
      possible: { range: [14, 15], label: "Possible Bipolar Disorder" },
    },
    subscales: {
      positiveActivation: [3, 4, 8, 9], // Increased energy/activity, grandiosity, decreased need for sleep
      negativeActivation: [1, 2, 6, 7, 12, 13], // Irritability, racing thoughts, negative affectivity, distractibility
    },

    getScore: (answers: number[]) => {
      // Calculate raw score for the first 13 questions (Yes = 1, No = 0)
      const { positiveActivation } = MDQ.scoring.subscales;
      const rawScore = answers
        .slice(0, 13)
        .reduce(
          (acc, curr, index) =>
            acc + (positiveActivation.includes(index) ? curr : Number(!curr)),
          0
        );

      // Check if the symptoms clustered in the same period (question 14) and the severity of the symptoms (question 15)
      const symptomsClustered = answers[13] === 1;
      const problemRating = answers[14];
      const severityProblem = problemRating >= 2;

      if (rawScore >= 7 && symptomsClustered && severityProblem) {
        return 14; // Possible Bipolar Disorder
      }

      return rawScore;
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess symptoms of bipolar disorder. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default MDQ;
