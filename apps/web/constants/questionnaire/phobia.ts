import { QuestionnaireProps, QUESTIONNAIRE_SCORING } from "../scoring";

// interface PHQScale {
//   items: number[];
//   label: string;
// }
//
// interface PHQScoring {
//   scoreOptions: Record<number, number>;
//   scales: {
//     totalPhobiaScore: PHQScale;
//     agoraphobiaScore: PHQScale;
//     bloodInjuryPhobiaScore: PHQScale;
//     socialPhobiaScore: PHQScale;
//   };
//   getScaleScore: (
//     answers: number[],
//     scale: keyof PHQScoring["scales"]
//   ) => number;
//   getSeverity: (score: number) => string;
// }
//
// interface PHQType {
//   description: string;
//   questions: Question[];
//   scoring: PHQScoring;
//   disclaimer: string;
// }

const PHQ: any = {
  title: "Personal Health Questionnaire",
  description:
    "The PHQ is a self-administered questionnaire used to assess the extent to which individuals avoid specific situations due to fear or other unpleasant feelings. It is commonly used for diagnosing and monitoring phobic symptoms.",
  questions: [
    {
      prefix: "",
      question: "Injections or minor surgery",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Eating or drinking with other people",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Hospitals",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Traveling alone on public transportation (e.g. bus or train)",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Walking alone in busy streets",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Being watched or stared at",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Going in to crowded shops",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Talking to people in authority",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Sight of blood",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Being criticized",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Going alone far from home",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Thought of injury or illness",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Speaking or acting to an audience",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Large open spaces",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
    {
      prefix: "",
      question: "Going to the dentist",
      options: [
        "Would not avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Slightly avoid it",
        "Definitely avoid it",
        "Definitely avoid it",
        "Markedly avoid it",
        "Markedly avoid it",
        "Always avoid",
      ],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,

    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 },
    severityLevels: {
      none: { range: [0, 0], label: "No Phobia" },
      clinical: { range: [1, Infinity], label: "Clinical Phobia" },
    },

    // FIX: The scoring logic is not implemented yet
    // scales: {
    //   totalPhobiaScore: {
    //     items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    //     label: "Total Phobia Score (PHQ_TOT)",
    //   },
    //   agoraphobiaScore: {
    //     items: [3, 4, 6, 10, 13],
    //     label: "Agoraphobia Score (PHQ_AGO)",
    //   },
    //   bloodInjuryPhobiaScore: {
    //     items: [0, 2, 8, 11, 14],
    //     label: "Blood-Injury Phobia Score (PHQ_BLD)",
    //   },
    //   socialPhobiaScore: {
    //     items: [1, 5, 7, 9, 12],
    //     label: "Social Phobia Score (PHQ_SOC)",
    //   },
    // },
    // getScaleScore: (answers, scale) => {
    //   const scaleItems = PHQ.scoring.scales[scale]?.items;
    //   if (!scaleItems) return 0;
    //
    //   return scaleItems.reduce(
    //     (total, index) => total + (answers[index] || 0),
    //     0
    //   );
    // },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of phobic symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PHQ;
