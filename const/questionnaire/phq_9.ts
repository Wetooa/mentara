const PHQ_9 = {
  description:
    "The PHQ-9 is a self-administered questionnaire used to assess the severity of depressive symptoms over the past two weeks. It is commonly used for diagnosing and monitoring depression.",
  questions: [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself",
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [1, 4], label: "Minimal Depression" },
      mild: { range: [5, 9], label: "Mild Depression" },
      moderate: { range: [10, 14], label: "Moderate Depression" },
      moderatelySevere: {
        range: [15, 19],
        label: "Moderately Severe Depression",
      },
      severe: { range: [20, 27], label: "Severe Depression" },
    },
    getSeverity: (score: number) => {
      if (score >= 1 && score <= 4) return "Minimal Depression";
      if (score >= 5 && score <= 9) return "Mild Depression";
      if (score >= 10 && score <= 14) return "Moderate Depression";
      if (score >= 15 && score <= 19) return "Moderately Severe Depression";
      if (score >= 20 && score <= 27) return "Severe Depression";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of depressive symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PHQ_9;
