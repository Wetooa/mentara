const SPIN = {
  description:
    "The Social Phobia Inventory (SPIN) is a self-administered questionnaire developed by Duke University's Psychiatry and Behavioral Sciences Department. It is used to screen for and measure the severity of social anxiety disorder.",
  questions: [
    "I am afraid of people in authority",
    "I am bothered by blushing in front of people",
    "Parties and social events scare me",
    "I avoid talking to people I don’t know",
    "Being criticized scares me a lot",
    "I avoid doing things or speaking to people for fear of embarrassment",
    "Sweating in front of people causes me distress",
    "I avoid going to parties",
    "I avoid activities in which I am the center of attention",
    "Talking to strangers scares me",
    "I avoid having to give speeches",
    "I would do anything to avoid being criticized",
    "Heart palpitations bother me when I am around people",
    "I am afraid of doing things when people might be watching",
    "Being embarrassed or looking stupid are among my worst fears",
    "I avoid speaking to anyone in authority",
    "Trembling or shaking in front of others is distressing to me",
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      minimal: { range: [0, 20], label: "Minimal or No Social Phobia" },
      mild: { range: [21, 30], label: "Mild Social Phobia" },
      moderate: { range: [31, 40], label: "Moderate Social Phobia" },
      severe: { range: [41, 50], label: "Severe Social Phobia" },
      verySevere: { range: [51, 68], label: "Very Severe Social Phobia" },
    },
    getSeverity: (score: number): string => {
      if (score >= 0 && score <= 20) return "Minimal or No Social Phobia";
      if (score >= 21 && score <= 30) return "Mild Social Phobia";
      if (score >= 31 && score <= 40) return "Moderate Social Phobia";
      if (score >= 41 && score <= 50) return "Severe Social Phobia";
      if (score >= 51 && score <= 68) return "Very Severe Social Phobia";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of social anxiety disorder. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default SPIN;
