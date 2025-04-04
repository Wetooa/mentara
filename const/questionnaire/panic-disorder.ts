const PDSS = {
  description:
    "The Panic Disorder Severity Scale (PDSS) is a self-administered questionnaire used to assess the severity of panic disorder symptoms, including panic attacks, avoidance behaviors, and the impact on daily functioning.",
  questions: [
    "How many panic and limited symptom attacks did you have during the week?",
    "If you had any panic attacks during the past week, how distressing were they while they were happening?",
    "During the past week, how much have you worried or felt anxious about when your next panic attack would occur or about fears related to the attacks?",
    "During the past week, were there any places or situations you avoided or felt afraid of due to fear of having a panic attack?",
    "During the past week, were there any activities that you avoided or felt afraid of because they might trigger a panic attack?",
    "During the past week, how much did the symptoms interfere with your ability to work or carry out responsibilities?",
    "During the past week, how much did panic attacks and their consequences interfere with your social life?",
  ],
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    compositeScoreRange: [0, 28],
    getCompositeScore: (scores: number[]) => {
      const sum = scores.reduce((acc, score) => acc + score, 0);
      return sum / scores.length;
    },
    getSeverity: (compositeScore: number) => {
      if (compositeScore >= 0 && compositeScore <= 1.5)
        return "Minimal Panic Disorder";
      if (compositeScore > 1.5 && compositeScore <= 3.0)
        return "Mild Panic Disorder";
      if (compositeScore > 3.0 && compositeScore <= 4.5)
        return "Moderate Panic Disorder";
      if (compositeScore > 4.5 && compositeScore <= 6.0)
        return "Severe Panic Disorder";
      if (compositeScore > 6.0) return "Extreme Panic Disorder";
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of panic disorder symptoms. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};

export default PDSS;
