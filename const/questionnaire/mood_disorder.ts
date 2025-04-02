const MDQ = {
  description:
    "The Mood Disorder Questionnaire (MDQ) is a self-administered screening tool used to help assess bipolar disorder. It is designed to evaluate the presence of symptoms of mania or hypomania over a period of time.",
  questions: [
    "In the past, have you felt so good or so hyper that other people thought you were not your normal self or you were so hyper that you got into trouble?",
    "In the past, have you been so irritable that you shouted at people or started fights or arguments?",
    "In the past, have you felt much more self-confident than usual?",
    "In the past, did you get much less sleep than usual and found you didn’t really miss it?",
    "In the past, have you been much more talkative or spoke faster than usual?",
    "In the past, have thoughts raced through your head or you couldn’t slow your mind down?",
    "In the past, have you been so easily distracted by things around you that you had trouble concentrating or staying on track?",
    "In the past, have you had much more energy than usual?",
    "In the past, were you much more active or did many more things than usual?",
    "In the past, were you much more social or outgoing than usual, for example, you telephoned friends in the middle of the night?",
    "In the past, were you much more interested in sex than usual?",
    "In the past, did you do things that were unusual for you or that other people might have thought were excessive, foolish, or risky?",
    "In the past, did spending money get you or your family into trouble?",
    "If you answered YES to more than one of the above, have several of these ever happened during the same period of time?",
    "How much of a problem did any of these cause you, such as being unable to work; having family, money, or legal troubles; getting into arguments or fights?",
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1 },
    scoreThreshold: 7, // Score threshold for questions 1-13
    severityLevels: {
      low: { range: [0, 6], label: "No significant symptoms" },
      moderate: { range: [7, 10], label: "Possible mood disorder" },
      high: { range: [11, 13], label: "High likelihood of bipolar disorder" },
    },
    getSeverity: (score: number) => {
      if (score >= 0 && score <= 6) return "No significant symptoms";
      if (score >= 7 && score <= 10) return "Possible mood disorder";
      if (score >= 11 && score <= 13)
        return "High likelihood of bipolar disorder";
      return "Invalid score";
    },
  },
  subscales: {
    positiveActivation: [3, 4, 8, 9], // Increased energy/activity, grandiosity, decreased need for sleep
    negativeActivation: [1, 2, 6, 7, 12, 13], // Irritability, racing thoughts, negative affectivity, distractibility
  },
  disclaimer:
    "This questionnaire is a screening tool to assess symptoms of bipolar disorder. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
  interpretScore: (answers: number[], problemRating: number) => {
    // Calculate raw score for the first 13 questions (Yes = 1, No = 0)
    const rawScore = answers.slice(0, 13).reduce((acc, curr) => acc + curr, 0);

    // Check if the symptoms clustered in the same period (question 14) and the severity of the symptoms (question 15)
    const symptomsClustered = answers[13] === 1; // Yes to symptoms clustering
    const severityProblem = problemRating >= 2; // Moderate or serious problem

    // Determine if the criteria for bipolar disorder is met
    if (rawScore >= 7 && symptomsClustered && severityProblem) {
      return "Possible Bipolar Disorder";
    }

    // Determine severity level of symptoms
    if (rawScore <= 6) return "No significant symptoms";
    if (rawScore >= 7 && rawScore <= 10) return "Possible mood disorder";
    return "High likelihood of bipolar disorder";
  },
};

export default MDQ;
