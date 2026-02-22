import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const MDQ: any = {
  title: "Mood Disorder Questionnaire",
  description:
    "The Mood Disorder Questionnaire (MDQ) is a self-administered screening tool used to help assess bipolar disorder. It is designed to evaluate the presence of symptoms of mania or hypomania over a period of time.",
  questions: [
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question:
        "you felt so good or so hyper that other people thought you were not your normal self or you were so hyper that you got into trouble?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question:
        "you were so irritable that you shouted at people or started fights or arguments?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question: "you felt much more self-confident than usual?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question:
        "you got much less sleep than usual and found you didn't really miss it?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question: "you were much more talkative or spoke faster than usual?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question:
        "thoughts raced through your head or you couldn't slow your mind down?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question:
        "you were so easily distracted by things around you that you had trouble concentrating or staying on track?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question: "you had much more energy than usual?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question: "you were much more active or did many more things than usual?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question:
        "you were much more social or outgoing than usual, for example, you telephoned friends in the middle of the night?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question: "you were much more interested in sex than usual?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question:
        "you did things that were unusual for you or that other people might have thought were excessive, foolish, or risky?",
      options: ["No", "Yes"],
    },
    {
      prefix: "Has there ever been a period of time when you were not your usual self and...",
      question: "spending money got you or your family into trouble?",
      options: ["No", "Yes"],
    },
    {
      prefix:
        "If you checked YES to more than one of the above",
      question:
        "have several of these ever happened during the same period of time?",
      options: ["No", "Yes"],
    },
    {
      prefix: "",
      question:
        "How much of a problem did any of these cause you - like being unable to work; having family, money, or legal troubles; getting into arguments or fights?",
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
      negative: { range: [0, 0], label: "Negative Screen" },
      positive: { range: [1, 1], label: "Positive Bipolar Screen (All 3 Criteria Met)" },
    },
    getInterpretationFromAnswers: (answers: number[]) => {
      // 1. 7+ Yes in questions 0-12 (Yes=1)
      const symptomCount = answers.slice(0, 13).filter(a => a === 1).length;
      // 2. Symptom clustering (Question 13: Yes=1)
      const clustering = answers[13] === 1;
      // 3. Moderate/Serious problem (Question 14: Moderate=2, Serious=3)
      const impairment = answers[14] >= 2;

      return (symptomCount >= 7 && clustering && impairment)
        ? "Positive Bipolar Screen (All 3 Criteria Met)"
        : "Negative Screen";
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
            acc + (positiveActivation?.includes(index) ? curr : Number(!curr)),
          0
        );

      // Check if the symptoms clustered in the same period (question 14) and the severity of the symptoms (question 15)
      const symptomsClustered = answers[13] === 1;
      const problemRating = answers[14];
      const severityProblem = (problemRating ?? 0) >= 2;

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
