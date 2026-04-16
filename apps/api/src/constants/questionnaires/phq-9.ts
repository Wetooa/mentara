import { QuestionnaireProps, QUESTIONNAIRE_SCORING } from "../scoring";

const PHQ_9: any = {
  title: "Patient Health Questionnaire",
  description:
    "The PHQ-9 is a self-administered questionnaire used to assess the severity of depressive symptoms over the past two weeks. It is commonly used for diagnosing and monitoring depression.",
  questions: [
    {
      prefix: "Over the last two weeks",
      question: "Little interest or pleasure in doing things",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question: "Feeling down, depressed, or hopeless",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question: "Trouble falling or staying asleep, or sleeping too much",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question: "Feeling tired or having little energy",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question: "Poor appetite or overeating",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question:
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question:
        "Trouble concentrating on things, such as reading the newspaper or watching television",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question:
        "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question:
        "Thoughts that you would be better off dead, or of hurting yourself in some way",
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
      minimal: { range: [0, 4], label: "Minimal" },
      mild: { range: [5, 9], label: "Mild" },
      moderate: { range: [10, 14], label: "Moderate" },
      moderatelySevere: { range: [15, 19], label: "Moderately Severe" },
      severe: { range: [20, 27], label: "Severe" },
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of depressive symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PHQ_9;
