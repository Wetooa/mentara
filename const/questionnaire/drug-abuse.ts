const DAST_10 = {
  description:
    "The Drug Abuse Screening Test (DAST-10) is a self-administered questionnaire designed to assess drug use and its potential consequences over the past 12 months. It is used for screening and evaluating substance use disorders.",
  questions: [
    "Have you used drugs other than those required for medical reasons?",
    "Do you use more than one drug at a time?",
    "Are you always able to stop using drugs when you want to?",
    "Have you had 'blackouts' or 'flashbacks' as a result of drug use?",
    "Do you ever feel bad or guilty about your drug use?",
    "Does your spouse (or parents) ever complain about your involvement with drugs?",
    "Have you neglected your family because of your use of drugs?",
    "Have you engaged in illegal activities in order to obtain drugs?",
    "Have you ever experienced withdrawal symptoms (felt sick) when you stopped taking drugs?",
    "Have you had medical problems as a result of your drug use (e.g., memory loss, hepatitis, convulsions, bleeding, etc.)?",
  ],
  scoring: {
    scoreOptions: { yes: 1, no: 0 },
    severityLevels: {
      none: { range: [0], label: "No problems reported" },
      low: { range: [1, 2], label: "Low level - Monitor, reassess later" },
      moderate: {
        range: [3, 5],
        label: "Moderate level - Further investigation",
      },
      substantial: {
        range: [6, 8],
        label: "Substantial level - Intensive assessment",
      },
      severe: { range: [9, 10], label: "Severe level - Intensive assessment" },
    },
    getSeverity: (score: number) => {
      if (score === 0) return "No problems reported";
      if (score >= 1 && score <= 2)
        return "Low level - Monitor, reassess later";
      if (score >= 3 && score <= 5)
        return "Moderate level - Further investigation";
      if (score >= 6 && score <= 8)
        return "Substantial level - Intensive assessment";
      if (score >= 9 && score <= 10)
        return "Severe level - Intensive assessment";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool for substance use disorders and does not provide a definitive diagnosis. A clinical evaluation by a healthcare professional is necessary for a formal assessment.",
};

export default DAST_10;
