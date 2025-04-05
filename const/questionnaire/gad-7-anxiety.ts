const GAD_7_ANXIETY = {
  description:
    "The GAD-7 Anxiety Assessment helps measure anxiety severity over the past two weeks. It assigns scores based on how often the respondent has been bothered by specific anxiety-related problems.",
  questions: [
    {
      prefix: "Over the past two weeks",
      question: "how often have you been feeling nervous, anxious, or on edge?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "how often have you been unable to stop or control worrying?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "how often have you been worrying too much about different things?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "how often have you had trouble relaxing?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "how often have you been so restless that it is hard to sit still?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "how often have you become easily annoyed or irritable?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "how often have you felt afraid, as if something awful might happen?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3 },
    anxietyLevels: {
      minimal: { range: [0, 4], label: "Minimal Anxiety" },
      mild: { range: [5, 9], label: "Mild Anxiety" },
      moderate: { range: [10, 14], label: "Moderate Anxiety" },
      severe: { range: [15, 21], label: "Severe Anxiety" },
    },
  },
  getAnxietyLevel: (score: number) => {
    if (score >= 0 && score <= 4) return "Minimal Anxiety";
    if (score >= 5 && score <= 9) return "Mild Anxiety";
    if (score >= 10 && score <= 14) return "Moderate Anxiety";
    if (score >= 15 && score <= 21) return "Severe Anxiety";
    return "Invalid score";
  },
  disclaimer:
    "The GAD-7 scores do not reflect any particular diagnosis or treatment course. They are designed to assess your anxiety level. If you have concerns about your mental health, please consult a medical professional.",
};

export default GAD_7_ANXIETY;
