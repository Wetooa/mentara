import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const OCI_R: QuestionnaireProps = {
  title: "Obsessive-Compulsive Inventory - Revised (OCI-R)",
  description:
    "The Obsessive-Compulsive Inventory - Revised (OCI-R) is a self-administered questionnaire used to assess the severity of obsessive-compulsive disorder (OCD) symptoms. It is commonly used for diagnosing and monitoring OCD, focusing on obsessive thoughts and compulsive behaviors.",
  questions: [
    {
      prefix: "",
      question: "I have saved up so many things that they get in the way.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I check things more often than necessary.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I get upset if objects are not arranged properly.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I feel compelled to count while I am doing things.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question:
        "I find it difficult to touch an object when I know it has been touched by strangers or certain people.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I find it difficult to control my own thoughts.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I collect things I don’t need.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I repeatedly check doors, windows, drawers, etc.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I get upset if others change the way I have arranged things.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I feel I have to repeat certain numbers.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question:
        "I sometimes have to wash or clean myself simply because I feel contaminated.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question:
        "I am upset by unpleasant thoughts that come into my mind against my will.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question:
        "I avoid throwing things away because I am afraid I might need them later.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question:
        "I repeatedly check gas and water taps and light switches after turning them off.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I need things to be arranged in a particular way.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I feel that there are good and bad numbers.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question: "I wash my hands more often and longer than necessary.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
    {
      prefix: "",
      question:
        "I frequently get nasty thoughts and have difficulty in getting rid of them.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      minimal: { range: [0, 12], label: "Minimal OCD Symptoms" },
      mild: { range: [13, 24], label: "Mild OCD Symptoms" },
      moderate: { range: [25, 36], label: "Moderate OCD Symptoms" },
      severe: { range: [37, 48], label: "Severe OCD Symptoms" },
      extreme: { range: [49, 60], label: "Extreme OCD Symptoms" },
    },

    // FIX: Add the following properties to the scoring object
    // OCDComponentScoreRange: [0, 60],
    // HoardingSubscaleScoreRange: [0, 12],
    // OCDSubscaleScores: {
    //   washing: [5, 11, 17],
    //   obsessing: [6, 12, 18],
    //   ordering: [3, 9, 15],
    //   checking: [2, 8, 14],
    //   neutralising: [4, 10, 16],
    // },
    // getSubscaleScore: (answers: number[], indices: number[]) => {
    //   return indices.reduce((sum, index) => {
    //     const ans = answers[index];
    //     return sum + (OCI_R.scoring.scoreMapping[ans] ?? 0);
    //   }, 0);
    // },
    // getHoardingSeverity: (score: number) => {
    //   if (score >= 0 && score <= 6) return "Minimal Hoarding Symptoms";
    //   if (score > 6 && score <= 9) return "Mild Hoarding Symptoms";
    //   if (score > 9 && score <= 12) return "Severe Hoarding Symptoms";
    //   return "Invalid score";
    // },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of obsessive-compulsive disorder (OCD) and hoarding disorder symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default OCI_R;
