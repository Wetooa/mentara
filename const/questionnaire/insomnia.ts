import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const INSOMNIA_SURVEY: QuestionnaireProps = {
  title: "Insomnia Severity Index (ISI)",
  description:
    "The Insomnia Severity Index (ISI) is a self-administered questionnaire used to assess the severity of insomnia symptoms over the past two weeks. It helps determine the impact of sleep difficulties on daily life.",
  questions: [
    {
      prefix: "Over the past two weeks",
      question: "how much difficulty have you had falling asleep?",
      options: ["None", "Mild", "Moderate", "Severe", "Very severe"],
    },
    {
      prefix: "Over the past two weeks",
      question: "how much difficulty have you had staying asleep?",
      options: ["None", "Mild", "Moderate", "Severe", "Very severe"],
    },
    {
      prefix: "Over the past two weeks",
      question: "how much of a problem has waking up too early been for you?",
      options: ["None", "Mild", "Moderate", "Severe", "Very severe"],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "how satisfied or dissatisfied are you with your current sleep pattern?",
      options: [
        "Very satisfied",
        "Satisfied",
        "Neutral",
        "Dissatisfied",
        "Very dissatisfied",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "how much has your sleep problem interfered with your daily functioning?",
      options: ["Not at all", "A little", "Somewhat", "Much", "Very much"],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "how noticeable do you think your sleep problems are to others?",
      options: [
        "Not at all noticeable",
        "A little noticeable",
        "Somewhat noticeable",
        "Quite noticeable",
        "Very noticeable",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "how worried or distressed are you about your current sleep problem?",
      options: ["Not at all", "A little", "Somewhat", "Much", "Very much"],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
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
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of insomnia symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your sleep health, please consult a healthcare professional.",
};

export default INSOMNIA_SURVEY;
