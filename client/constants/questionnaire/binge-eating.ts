import { QuestionnaireProps } from "../scoring";

const BES: QuestionnaireProps = {
  title: "Binge-Eating Scale (BES)",
  description:
    "The Binge-Eating Scale (BES) is a self-assessment tool designed to evaluate the severity of binge-eating behaviors. It helps individuals understand their eating patterns and whether they may indicate symptoms consistent with binge-eating disorder.",
  questions: [
    {
      prefix: "",
      question:
        "I don’t feel self-conscious about my weight or body size when I’m with others.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I don’t have any difficulty eating slowly in the proper manner.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I feel capable to control my eating urges when I want to.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I don’t have the habit of eating when I’m bored.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I’m usually physically hungry when I eat something.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I don’t feel any guilt or self-hate after I overeat.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I don’t lose total control of my eating when dieting even after periods when I overeat.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I rarely eat so much food that I feel uncomfortably stuffed afterwards.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "My level of calorie intake does not go up very high or go down very low on a regular basis.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I usually am able to stop eating when I want to. I know when ‘enough is enough.’",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I don’t have any problem stopping eating when I feel full.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I seem to eat just as much when I’m with others as when I’m by myself.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I eat three meals a day with only an occasional between-meal snack.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I don’t think much about trying to control unwanted eating urges.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I don’t think about food a great deal.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I usually know whether or not I’m physically hungry. I take the right portion of food to satisfy me.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 17], label: "No or Minimal Binge-Eating" },
      mildModerate: { range: [18, 26], label: "Mild to Moderate Binge-Eating" },
      severe: { range: [27, 46], label: "Severe Binge-Eating" },
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of binge-eating behaviors. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your eating habits, please consult a healthcare professional.",
};

export default BES;
