import { QuestionnaireProps, QUESTIONNAIRE_SCORING } from "../scoring";

const PDSS: any = {
  title: "Panic Disorder Severity Scale",
  description:
    "The Panic Disorder Severity Scale (PDSS) is a self-administered questionnaire used to assess the severity of panic disorder symptoms, including panic attacks, avoidance behaviors, and the impact on daily functioning.",
  questions: [
    {
      prefix: "During the past week",
      question: "How many panic and limited symptoms attacks did you have during the week?",
      options: [
        "No panic or limited symptom episodes",
        "Mild: no full panic attacks and no more than 1 limited symptom attack/day",
        "Moderate: 1 or 2 full panic attacks and/or multiple limited symptom attacks/day",
        "Severe: more than 2 full attacks but not more than 1/day on average",
        "Extreme: full panic attacks occurred more than once a day, more days than not",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "If you had any panic attacks during the past week, how distressing (uncomfortable, frightening) were they while they were happening?",
      options: [
        "Not at all distressing, or no panic or limited symptom attacks during the past week",
        "Mildly distressing (not too intense)",
        "Moderately distressing (intense, but still manageable)",
        "Severely distressing (very intense)",
        "Extremely distressing (extreme distress during all attacks)",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "During the past week, how much have you worried or felt anxious about when your next panic attack would occur or about fears related to the attacks?",
      options: [
        "Not at all",
        "Occasionally or only mildly",
        "Frequently or moderately",
        "Very often or to a very disturbing degree",
        "Nearly constantly and to a disabling extent",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "During the past week were there any places or situations you avoided, or felt afraid of, because of fear of having a panic attack?",
      options: [
        "None: no fear or avoidance",
        "Mild: occasional fear and/or avoidance; little or no modification of lifestyle",
        "Moderate: noticeable fear and/or avoidance but still manageable; some lifestyle modification",
        "Severe: extensive avoidance; substantial modification of lifestyle required",
        "Extreme: pervasive disabling fear and/or avoidance; extensive lifestyle modification",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "During the past week, were there any activities that you avoided, or felt afraid of, because they caused physical sensations like those you feel during panic attacks?",
      options: [
        "No fear or avoidance of situations or activities because of distressing physical sensations",
        "Mild: occasional fear and/or avoidance; little lifestyle modification",
        "Moderate: noticeable avoidance but still manageable; limited lifestyle modification",
        "Severe: extensive avoidance; substantial modification of lifestyle or interference in functioning",
        "Extreme: pervasive and disabling avoidance; important tasks not performed",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "During the past week, how much did the above symptoms altogether interfere with your ability to work or carry out your responsibilities at home?",
      options: [
        "No interference with work or home responsibilities",
        "Slight interference; could do nearly everything",
        "Significant interference; still could manage to do the things I needed to do",
        "Substantial impairment; many important things I couldn't do",
        "Extreme, incapacitating impairment; essentially unable to manage responsibilities",
      ],
    },
    {
      prefix: "During the past week",
      question:
        "During the past week, how much did panic and limited symptom attacks, worry about attacks and fear of situations and activities because of attacks interfere with your social life?",
      options: [
        "No interference",
        "Slight interference with social activities; could do nearly everything",
        "Significant interference; could manage most things if I made the effort",
        "Substantial impairment; many social things I couldn't do",
        "Extreme, incapacitating impairment; hardly anything social I could do",
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
