import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const GAD_7_ANXIETY: any = {
  title: "Generalized Anxiety Disorder",
  description:
    "The GAD-7 Anxiety Assessment helps measure anxiety severity over the past two weeks. It assigns scores based on how often the respondent has been bothered by specific anxiety-related problems.",
  questions: [
    {
      prefix: "Over the past two weeks",
      question: "Feeling nervous, anxious or on edge",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "Not being able to stop or control worrying",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "Worrying too much about different things",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "Trouble relaxing",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "Being so restless that it is hard to sit still",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "Becoming easily annoyed or irritable",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the past two weeks",
      question: "Feeling afraid as if something awful might happen",
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
