import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const MBI: QuestionnaireProps = {
  title: "Maslach Burnout Inventory",
  description:
    "The Maslach Burnout Inventory (MBI) is a self-assessment tool used to measure burnout risk. It evaluates three key components: Emotional Exhaustion, Depersonalization, and Personal Achievement. This tool should not be used as a formal diagnosis but as an awareness tool.",
  questions: [
    // Burnout (Emotional Exhaustion) questions
    {
      prefix: "Burnout (Emotional Exhaustion)",
      question: "I feel emotionally drained by my work.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Burnout (Emotional Exhaustion)",
      question:
        "Working with people all day long requires a great deal of effort.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Burnout (Emotional Exhaustion)",
      question: "I feel like my work is breaking me down.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Burnout (Emotional Exhaustion)",
      question: "I feel frustrated by my work.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Burnout (Emotional Exhaustion)",
      question: "I feel I work too hard at my job.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Burnout (Emotional Exhaustion)",
      question:
        "It stresses me too much to work in direct contact with people.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Burnout (Emotional Exhaustion)",
      question: "I feel like I'm at the end of my rope.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },

    // Depersonalization questions
    {
      prefix: "Depersonalization",
      question:
        "I feel I look after certain patients/clients impersonally, as if they are objects.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Depersonalization",
      question:
        "I feel tired when I get up in the morning and have to face another day at work.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Depersonalization",
      question:
        "I have the impression that my patients/clients make me responsible for some of their problems.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Depersonalization",
      question: "I am at the end of my patience at the end of my work day.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Depersonalization",
      question:
        "I really don't care about what happens to some of my patients/clients.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Depersonalization",
      question:
        "I have become more insensitive to people since I've been working.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Depersonalization",
      question: "I'm afraid that this job is making me uncaring.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },

    // Personal Achievement questions
    {
      prefix: "Personal Achievement",
      question: "I accomplish many worthwhile things in this job.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Personal Achievement",
      question: "I feel full of energy.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Personal Achievement",
      question: "I am easily able to understand what my patients/clients feel.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Personal Achievement",
      question: "I look after my patients'/clients' problems very effectively.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Personal Achievement",
      question: "In my work, I handle emotional problems very calmly.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Personal Achievement",
      question:
        "Through my work, I feel that I have a positive influence on people.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Personal Achievement",
      question:
        "I am easily able to create a relaxed atmosphere with my patients/clients.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
    {
      prefix: "Personal Achievement",
      question:
        "I feel refreshed when I have been close to my patients/clients at work.",
      options: [
        "Never",
        "A Few Times per Year",
        "Once a Month",
        "A Few Times per Month",
        "Once a Week",
        "A Few Times per Week",
        "Every Day",
      ],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,
    getInterpretationFromScore: (score: number): string => {
      if (score <= 17) return "Low-level burnout";
      if (score >= 18 && score <= 29) return "Moderate burnout";
      if (score >= 30) return "High-level burnout";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess burnout risk. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you are experiencing symptoms of burnout, please seek support from a healthcare professional.",
};

export default MBI;
