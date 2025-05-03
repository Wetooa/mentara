import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../questionnaires";

const GAD_7_ANXIETY: QuestionnaireProps = {
  title: "Anxiety Assessment (GAD-7)",
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
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 4], label: "Minimal Anxiety" },
      mild: { range: [5, 9], label: "Mild Anxiety" },
      moderate: { range: [10, 14], label: "Moderate Anxiety" },
      severe: { range: [15, 21], label: "Severe Anxiety" },
    },
  },
  disclaimer:
    "The GAD-7 scores do not reflect any particular diagnosis or treatment course. They are designed to assess your anxiety level. If you have concerns about your mental health, please consult a medical professional.",
};

export default GAD_7_ANXIETY;
