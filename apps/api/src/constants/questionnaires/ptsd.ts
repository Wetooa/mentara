import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const PCL_5: any = {
  title: "PTSD Checklist 5",
  description:
    "The PCL-5 is a self-administered questionnaire used to assess the severity of PTSD symptoms over the past month. It helps in diagnosing and monitoring PTSD.",
  questions: [
    {
      prefix: "In the past month",
      question: "Repeated, disturbing, and unwanted memories of the stressful experience?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Repeated, disturbing dreams of the stressful experience?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question:
        "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Feeling very upset when something reminded you of the stressful experience?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question:
        "Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Avoiding memories, thoughts, or feelings related to the stressful experience?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question:
        "Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Trouble remembering important parts of the stressful experience?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question:
        "Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question:
        "Blaming yourself or someone else for the stressful experience or what happened after it?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Loss of interest in activities that you used to enjoy?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Feeling distant or cut off from other people?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question:
        "Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Irritable behaviour, angry outbursts, or acting aggressively?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Taking too many risks or doing things that could cause you harm?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Being 'superalert' or watchful or on guard?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Feeling jumpy or easily startled?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Having difficulty concentrating?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
    {
      prefix: "In the past month",
      question: "Trouble falling or staying asleep?",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      belowThreshold: { range: [0, 32], label: "Below Threshold" },
      probablePTSD: { range: [33, 80], label: "Probable PTSD" },
    },
    // FIX: The subscale scores are not used in the current implementation.
    // subscaleScores: {
    //   reExperiencing: { range: [0, 20], label: "Re-experiencing" },
    //   avoidance: { range: [0, 8], label: "Avoidance" },
    //   negativeAlterations: {
    //     range: [0, 28],
    //     label: "Negative Alterations in Cognition and Mood",
    //   },
    //   hyperArousal: { range: [0, 24], label: "Hyper-arousal" },
    // },
    // getSubscaleSeverity: (score: number, subscale: string) => {
    //   if (subscale === "reExperiencing") {
    //     if (score <= 5) return "Normal";
    //     if (score > 5 && score <= 10) return "Mild";
    //     if (score > 10 && score <= 15) return "Moderate";
    //     return "Severe";
    //   }
    //   if (subscale === "avoidance") {
    //     if (score <= 2) return "Normal";
    //     if (score > 2 && score <= 4) return "Mild";
    //     if (score > 4 && score <= 6) return "Moderate";
    //     return "Severe";
    //   }
    //   if (subscale === "negativeAlterations") {
    //     if (score <= 7) return "Normal";
    //     if (score > 7 && score <= 14) return "Mild";
    //     if (score > 14 && score <= 21) return "Moderate";
    //     return "Severe";
    //   }
    //   if (subscale === "hyperArousal") {
    //     if (score <= 6) return "Normal";
    //     if (score > 6 && score <= 12) return "Mild";
    //     if (score > 12 && score <= 18) return "Moderate";
    //     return "Severe";
    //   }
    //   return "Invalid subscale";
    // },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of PTSD symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PCL_5;
