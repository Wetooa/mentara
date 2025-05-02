interface PHQScale {
  items: number[];
  label: string;
}

interface PHQScoring {
  scoreOptions: Record<number, number>;
  scales: {
    totalPhobiaScore: PHQScale;
    agoraphobiaScore: PHQScale;
    bloodInjuryPhobiaScore: PHQScale;
    socialPhobiaScore: PHQScale;
  };
  getScaleScore: (
    answers: number[],
    scale: keyof PHQScoring["scales"]
  ) => number;
  getSeverity: (score: number) => string;
}

interface PHQType {
  description: string;
  questions: Question[];
  scoring: PHQScoring;
  disclaimer: string;
}

const PHQ: PHQType = {
  description:
    "The PHQ is a self-administered questionnaire used to assess the extent to which individuals avoid specific situations due to fear or other unpleasant feelings. It is commonly used for diagnosing and monitoring phobic symptoms.",
  questions: [
    {
      prefix: "",
      question: "Injections or minor surgery",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Eating or drinking with other people",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Hospitals",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Traveling alone on public transportation (e.g., bus or train)",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Walking alone in busy streets",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Being watched or stared at",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Going in to crowded shops",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Talking to people in authority",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Sight of blood",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Being criticized",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Going alone far from home",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Thought of injury or illness",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Speaking or acting to an audience",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Large open spaces",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "",
      question: "Going to the dentist",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 },
    scales: {
      totalPhobiaScore: {
        items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        label: "Total Phobia Score (PHQ_TOT)",
      },
      agoraphobiaScore: {
        items: [3, 4, 6, 10, 13],
        label: "Agoraphobia Score (PHQ_AGO)",
      },
      bloodInjuryPhobiaScore: {
        items: [0, 2, 8, 11, 14],
        label: "Blood-Injury Phobia Score (PHQ_BLD)",
      },
      socialPhobiaScore: {
        items: [1, 5, 7, 9, 12],
        label: "Social Phobia Score (PHQ_SOC)",
      },
    },
    getScaleScore: (answers, scale) => {
      const scaleItems = PHQ.scoring.scales[scale]?.items;
      if (!scaleItems) return 0;

      return scaleItems.reduce(
        (total, index) => total + (answers[index] || 0),
        0
      );
    },
    getSeverity: (score) => {
      if (score <= 12) return "Minimal Phobia";
      if (score >= 13 && score <= 24) return "Mild Phobia";
      if (score >= 25 && score <= 36) return "Moderate Phobia";
      if (score >= 37) return "Severe Phobia";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of phobic symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PHQ;
