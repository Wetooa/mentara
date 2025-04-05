const PCL_5 = {
  description:
    "The PCL-5 is a self-administered questionnaire used to assess the severity of PTSD symptoms over the past month. It helps in diagnosing and monitoring PTSD.",
  questions: [
    {
      prefix: "In the past month",
      question:
        "have you had repeated, disturbing, and unwanted memories of the stressful experience?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you had repeated, disturbing dreams of the stressful experience?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you suddenly felt or acted as if the stressful experience were actually happening again (as if you were actually back there reliving it)?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you felt very upset when something reminded you of the stressful experience?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you had strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you been avoiding memories, thoughts, or feelings related to the stressful experience?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you been avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you had trouble remembering important parts of the stressful experience?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you had strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you blamed yourself or someone else for the stressful experience or what happened after it?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you had strong negative feelings such as fear, horror, anger, guilt, or shame?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question: "have you lost interest in activities that you used to enjoy?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question: "have you felt distant or cut off from other people?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you had trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you had irritable behavior, angry outbursts, or acted aggressively?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question:
        "have you taken too many risks or done things that could cause you harm?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question: "have you been 'superalert' or watchful or on guard?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question: "have you felt jumpy or easily startled?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question: "have you had difficulty concentrating?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
    {
      prefix: "In the past month",
      question: "have you had trouble falling or staying asleep?",
      options: [
        "Not at all",
        "A little bit",
        "Moderately",
        "Quite a bit",
        "Extremely",
      ],
    },
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      normal: { range: [0, 33], label: "Normal" },
      mild: { range: [34, 43], label: "Mild PTSD" },
      moderate: { range: [44, 53], label: "Moderate PTSD" },
      severe: { range: [54, 80], label: "Severe PTSD" },
    },
    getSeverity: (score: number) => {
      if (score <= 33) return "Normal";
      if (score >= 34 && score <= 43) return "Mild PTSD";
      if (score >= 44 && score <= 53) return "Moderate PTSD";
      if (score >= 54) return "Severe PTSD";
      return "Invalid score";
    },
    subscaleScores: {
      reExperiencing: { range: [0, 20], label: "Re-experiencing" },
      avoidance: { range: [0, 8], label: "Avoidance" },
      negativeAlterations: {
        range: [0, 28],
        label: "Negative Alterations in Cognition and Mood",
      },
      hyperArousal: { range: [0, 24], label: "Hyper-arousal" },
    },
    getSubscaleSeverity: (score: number, subscale: string) => {
      if (subscale === "reExperiencing") {
        if (score <= 5) return "Normal";
        if (score > 5 && score <= 10) return "Mild";
        if (score > 10 && score <= 15) return "Moderate";
        return "Severe";
      }
      if (subscale === "avoidance") {
        if (score <= 2) return "Normal";
        if (score > 2 && score <= 4) return "Mild";
        if (score > 4 && score <= 6) return "Moderate";
        return "Severe";
      }
      if (subscale === "negativeAlterations") {
        if (score <= 7) return "Normal";
        if (score > 7 && score <= 14) return "Mild";
        if (score > 14 && score <= 21) return "Moderate";
        return "Severe";
      }
      if (subscale === "hyperArousal") {
        if (score <= 6) return "Normal";
        if (score > 6 && score <= 12) return "Mild";
        if (score > 12 && score <= 18) return "Moderate";
        return "Severe";
      }
      return "Invalid subscale";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of PTSD symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PCL_5;
