import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const INSOMNIA_SURVEY: any = {
  title: "Insomnia Severity Index",
  description:
    "The Insomnia Severity Index (ISI) is a self-administered questionnaire used to assess the severity of insomnia symptoms over the past two weeks. It helps determine the impact of sleep difficulties on daily life.",
  questions: [
    {
      prefix: "Over the past two weeks",
      question: "Difficulty falling asleep",
      options: ["None", "Mild", "Moderate", "Severe", "Very Severe"],
    },
    {
      prefix: "Over the past two weeks",
      question: "Difficulty staying asleep",
      options: ["None", "Mild", "Moderate", "Severe", "Very Severe"],
    },
    {
      prefix: "Over the past two weeks",
      question: "Problem waking up too early",
      options: ["None", "Mild", "Moderate", "Severe", "Very Severe"],
    },
    {
      prefix: "Over the past two weeks",
      question: "How SATISFIED/dissatisfied are you with your current sleep pattern?",
      options: [
        "Very Satisfied",
        "Satisfied",
        "Moderately Satisfied",
        "Dissatisfied",
        "Very Dissatisfied",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "To what extent do you consider your sleep problem to INTERFERE with your daily functioning (e.g. daytime fatigue, ability to function at work/daily chores, concentration, memory, mood, etc.)",
      options: [
        "Not at all Interfering",
        "A Little",
        "Somewhat",
        "Much",
        "Very Much Interfering",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question:
        "How NOTICEABLE to others do you think your sleeping problem is in terms of impairing the quality of your life?",
      options: [
        "Not at all Noticeable",
        "Barely",
        "Somewhat",
        "Much",
        "Very Much Noticeable",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "How WORRIED/distressed are you about your current sleep problem?",
      options: ["Not at all", "A Little", "Somewhat", "Much", "Very Much"],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 7], label: "No Insomnia" },
      subthreshold: { range: [8, 14], label: "Subthreshold Insomnia" },
      moderate: { range: [15, 21], label: "Moderate Insomnia" },
      severe: { range: [22, 28], label: "Severe Insomnia" },
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of insomnia symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your sleep health, please consult a healthcare professional.",
};

export default INSOMNIA_SURVEY;
