const InsomniaSurvey = {
  description:
    "The Insomnia Severity Index (ISI) is a self-administered questionnaire used to assess the severity of insomnia symptoms over the past two weeks. It helps determine the impact of sleep difficulties on daily life.",
  questions: [
    "Difficulty falling asleep",
    "Difficulty staying asleep",
    "Problem waking up too early",
    "Satisfaction with current sleep pattern",
    "Interference with daily functioning due to sleep problems",
    "Noticeability of sleep problems to others",
    "Worry or distress about current sleep problem",
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      noInsomnia: {
        range: [0, 7],
        label: "No clinically significant insomnia",
      },
      subthreshold: { range: [8, 14], label: "Subthreshold insomnia" },
      moderate: {
        range: [15, 21],
        label: "Clinical insomnia (moderate severity)",
      },
      severe: { range: [22, 28], label: "Clinical insomnia (severe)" },
    },
    getSeverity: (score: number) => {
      if (score >= 0 && score <= 7) return "No clinically significant insomnia";
      if (score >= 8 && score <= 14) return "Subthreshold insomnia";
      if (score >= 15 && score <= 21)
        return "Clinical insomnia (moderate severity)";
      if (score >= 22 && score <= 28) return "Clinical insomnia (severe)";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of insomnia symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your sleep health, please consult a healthcare professional.",
};

export default InsomniaSurvey;
