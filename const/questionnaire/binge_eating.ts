const BES = {
  description:
    "The Binge-Eating Scale (BES) is a self-assessment tool designed to evaluate the severity of binge-eating behaviors. It helps individuals understand their eating patterns and whether they may indicate symptoms consistent with binge-eating disorder.",
  questions: [
    "I don’t feel self-conscious about my weight or body size when I’m with others.",
    "I don’t have any difficulty eating slowly in the proper manner.",
    "I feel capable to control my eating urges when I want to.",
    "I don’t have the habit of eating when I’m bored.",
    "I’m usually physically hungry when I eat something.",
    "I don’t feel any guilt or self-hate after I overeat.",
    "I don’t lose total control of my eating when dieting even after periods when I overeat.",
    "I rarely eat so much food that I feel uncomfortably stuffed afterwards.",
    "My level of calorie intake does not go up very high or go down very low on a regular basis.",
    "I usually am able to stop eating when I want to. I know when ‘enough is enough.’",
    "I don’t have any problem stopping eating when I feel full.",
    "I seem to eat just as much when I’m with others as when I’m by myself.",
    "I eat three meals a day with only an occasional between-meal snack.",
    "I don’t think much about trying to control unwanted eating urges.",
    "I don’t think about food a great deal.",
    "I usually know whether or not I’m physically hungry. I take the right portion of food to satisfy me.",
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 17], label: "No or Minimal Binge-Eating" },
      mildModerate: { range: [18, 26], label: "Mild to Moderate Binge-Eating" },
      severe: { range: [27, 46], label: "Severe Binge-Eating" },
    },
    getSeverity: (score: number) => {
      if (score >= 0 && score <= 17) return "No or Minimal Binge-Eating";
      if (score >= 18 && score <= 26) return "Mild to Moderate Binge-Eating";
      if (score >= 27 && score <= 46) return "Severe Binge-Eating";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of binge-eating behaviors. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your eating habits, please consult a healthcare professional.",
};

export default BES;
