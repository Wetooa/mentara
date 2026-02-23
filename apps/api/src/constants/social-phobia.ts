import { QuestionnaireProps, QUESTIONNAIRE_SCORING } from "../scoring";

const SIAS: any = {
  title: "Social Interaction Anxiety Scale",
  description:
    "The Social Phobia Inventory (SPIN) is a self-administered questionnaire developed by Duke University's Psychiatry and Behavioral Sciences Department. It is used to screen for and measure the severity of social anxiety disorder.",
  questions: [
    {
      prefix: "",
      question: "I get nervous if I have to speak with someone in authority (teacher, boss, etc.).",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I have difficulty making eye contact with others.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I become tense if I have to talk about myself or my feelings.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I find it difficult to mix comfortably with the people I work with.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I find it easy to make friends my own age.",
      options: [
        "Extremely characteristic or true of me",
        "Very characteristic or true of me",
        "Moderately characteristic or true of me",
        "Slightly characteristic or true of me",
        "Not at all characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I tense up if I meet an acquaintance in the street.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "When mixing socially, I am uncomfortable.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I feel tense if I am alone with just one other person.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I am at ease meeting people at parties, etc.",
      options: [
        "Extremely characteristic or true of me",
        "Very characteristic or true of me",
        "Moderately characteristic or true of me",
        "Slightly characteristic or true of me",
        "Not at all characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I have difficulty talking with other people.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I find it easy to think of things to talk about.",
      options: [
        "Extremely characteristic or true of me",
        "Very characteristic or true of me",
        "Moderately characteristic or true of me",
        "Slightly characteristic or true of me",
        "Not at all characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I worry about expressing myself in case I appear awkward.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I find it difficult to disagree with another's point of view.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I have difficulty talking to people I am attracted to.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I find myself worrying that I won't know what to say in social situations.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I am nervous mixing with people I don't know well.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I feel I'll say something embarrassing when talking.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "When mixing in a group, I find myself worrying I will be ignored.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I am tense mixing in a group.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
    {
      prefix: "",
      question: "I am unsure whether to greet someone I know only slightly.",
      options: [
        "Not at all characteristic or true of me",
        "Slightly characteristic or true of me",
        "Moderately characteristic or true of me",
        "Very characteristic or true of me",
        "Extremely characteristic or true of me",
      ],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      normal: { range: [0, 33], label: "Normal Social Anxiety" },
      potential: { range: [34, 42], label: "Social anxiety specific (Potential Social Phobia)" },
      generalized: { range: [43, 80], label: "Generalized Social Interaction Anxiety" },
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of social anxiety disorder. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default SIAS;
