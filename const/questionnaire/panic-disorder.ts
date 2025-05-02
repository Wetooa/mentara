import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../questionnaires";

const PDSS: QuestionnaireProps = {
  title: "Panic Disorder Severity Scale (PDSS)",
  description:
    "The Panic Disorder Severity Scale (PDSS) is a self-administered questionnaire used to assess the severity of panic disorder symptoms, including panic attacks, avoidance behaviors, and the impact on daily functioning.",
  questions: [
    {
      prefix: "During the past week",
      question: "how many panic and limited symptom attacks did you have?",
      options: ["None", "1-2", "3-4", "5-6", "7 or more"],
    },
    {
      prefix: "During the past week",
      question:
        "if you had any panic attacks, how distressing were they while they were happening?",
      options: [
        "Not at all distressing",
        "Mildly distressing",
        "Moderately distressing",
        "Severely distressing",
        "Extremely distressing",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "how much have you worried or felt anxious about when your next panic attack would occur or about fears related to the attacks?",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "were there any places or situations you avoided or felt afraid of due to fear of having a panic attack?",
      options: ["None", "A few", "Some", "Many", "Almost all"],
    },
    {
      prefix: "During the past week",
      question:
        "were there any activities that you avoided or felt afraid of because they might trigger a panic attack?",
      options: ["None", "A few", "Some", "Many", "Almost all"],
    },
    {
      prefix: "During the past week",
      question:
        "how much did the symptoms interfere with your ability to work or carry out responsibilities?",
      options: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "how much did panic attacks and their consequences interfere with your social life?",
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
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      minimal: { range: [0, 1.5], label: "Minimal Panic Disorder" },
      mild: { range: [1.5, 3.0], label: "Mild Panic Disorder" },
      moderate: { range: [3.0, 4.5], label: "Moderate Panic Disorder" },
      severe: { range: [4.5, 6.0], label: "Severe Panic Disorder" },
      extreme: { range: [6.0, 28], label: "Extreme Panic Disorder" },
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of panic disorder symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PDSS;
