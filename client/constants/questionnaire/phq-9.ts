import { QuestionnaireProps, QUESTIONNAIRE_SCORING } from "../scoring";

const PHQ_9: QuestionnaireProps = {
  title: "Patient Health Questionnaire-9 (PHQ-9)",
  description:
    "The PHQ-9 is a self-administered questionnaire used to assess the severity of depressive symptoms over the past two weeks. It is commonly used for diagnosing and monitoring depression.",
  questions: [
    {
      prefix: "Over the last two weeks",
      question:
        "how often have you had little interest or pleasure in doing things?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question: "how often have you been feeling down, depressed, or hopeless?",
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
        "how often have you had trouble falling or staying asleep, or sleeping too much?",
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
        "how often have you been feeling tired or having little energy?",
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day",
      ],
    },
    {
      prefix: "Over the last two weeks",
      question: "how often have you had poor appetite or been overeating?",
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
        "how often have you been feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
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
        "how often have you had trouble concentrating on things, such as reading the newspaper or watching television?",
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
        "how often have you been moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
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
        "how often have you had thoughts that you would be better off dead, or of hurting yourself?",
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
      minimal: { range: [1, 4], label: "Minimal Depression" },
      mild: { range: [5, 9], label: "Mild Depression" },
      moderate: { range: [10, 14], label: "Moderate Depression" },
      moderatelySevere: {
        range: [15, 19],
        label: "Moderately Severe Depression",
      },
      severe: { range: [20, 27], label: "Severe Depression" },
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of depressive symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PHQ_9;
