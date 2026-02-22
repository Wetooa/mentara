import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const AUDIT: {
  standardDrinks: Record<string, Record<string, number>>;
} & QuestionnaireProps = {
  title: "Alcohol Use Disorders Identification Test",
  description:
    "The Alcohol Use Disorders Identification Test (AUDIT) is a 10-item screening tool developed by the World Health Organization (WHO) to assess alcohol consumption, drinking behaviors, and alcohol-related problems. A score of 8 or more is considered to indicate hazardous or harmful alcohol use.",
  questions: [
    {
      prefix: "Frequency",
      question: "How often do you have a drink containing alcohol?",
      options: [
        "Never",
        "Monthly or less",
        "2 to 4 times a month",
        "2 to 3 times a week",
        "4 or more times a week",
      ],
    },
    {
      prefix: "Quantity",
      question:
        "How many drinks containing alcohol do you have on a typical day when you are drinking?",
      options: ["1 or 2", "3 or 4", "5 or 6", "7, 8, or 9", "10 or more"],
    },
    {
      prefix: "Binge Drinking",
      question: "How often do you have six or more drinks on one occasion?",
      options: [
        "Never",
        "Less than monthly",
        "Monthly",
        "Weekly",
        "Daily or almost daily",
      ],
    },
    {
      prefix: "Loss of Control",
      question:
        "How often during the last year have you found that you were not able to stop drinking once you had started?",
      options: [
        "Never",
        "Less than monthly",
        "Monthly",
        "Weekly",
        "Daily or almost daily",
      ],
    },
    {
      prefix: "Neglected Responsibilities",
      question:
        "How often during the last year have you failed to do what was normally expected from you because of drinking?",
      options: [
        "Never",
        "Less than monthly",
        "Monthly",
        "Weekly",
        "Daily or almost daily",
      ],
    },
    {
      prefix: "Morning Drinking",
      question:
        "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?",
      options: [
        "Never",
        "Less than monthly",
        "Monthly",
        "Weekly",
        "Daily or almost daily",
      ],
    },
    {
      prefix: "Guilt",
      question:
        "How often during the last year have you had a feeling of guilt or remorse after drinking?",
      options: [
        "Never",
        "Less than monthly",
        "Monthly",
        "Weekly",
        "Daily or almost daily",
      ],
    },
    {
      prefix: "Blackouts",
      question:
        "How often during the last year have you been unable to remember what happened the night before because you had been drinking?",
      options: [
        "Never",
        "Less than monthly",
        "Monthly",
        "Weekly",
        "Daily or almost daily",
      ],
    },
    {
      prefix: "Injuries",
      question:
        "Have you or someone else been injured as a result of your drinking?",
      options: [
        "No",
        "Yes, but not in the last year",
        "Yes, during the last year",
      ],
    },
    {
      prefix: "Concerns from Others",
      question:
        "Has a relative or friend or a doctor or another health worker been concerned about your drinking or suggested you cut down?",
      options: [
        "No",
        "Yes, but not in the last year",
        "Yes, during the last year",
      ],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,

    severityLevels: {
      lowRisk: { range: [0, 7], label: "Low Risk" },
      hazardous: { range: [8, 15], label: "Hazardous Use" },
      harmful: { range: [16, 19], label: "Harmful Use" },
      dependent: { range: [20, 40], label: "Possible Alcohol Dependence" },
    },
  },
  standardDrinks: {
    beer: { "12oz (~5%)": 1, "16oz": 1.3, "22oz": 2, "40oz": 3.3 },
    maltLiquor: {
      "8-9oz (~7%)": 1,
      "12oz": 1.5,
      "16oz": 2,
      "22oz": 2.5,
      "40oz": 4.5,
    },
    wine: { "5oz (~12%)": 1, "750mL (25oz) bottle": 5 },
    spirits: {
      "1.5oz (~40%)": 1,
      "pint (16oz)": 11,
      "fifth (25oz)": 17,
      "1.75L (59oz)": 39,
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess alcohol use disorder risk. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your alcohol consumption, please consult a healthcare professional.",
};

export default AUDIT;
