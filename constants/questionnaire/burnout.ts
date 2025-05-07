const BurnoutSection = {
  items: [
    {
      prefix: "",
      question: "I feel emotionally drained by my work.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "Working with people all day long requires a great deal of effort.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I feel like my work is breaking me down.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I feel frustrated by my work.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I feel I work too hard at my job.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "It stresses me too much to work in direct contact with people.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I feel like I'm at the end of my rope.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
  ],
  label: "Burnout (Emotional Exhaustion)",
  getSeverity: (score: number): string => {
    if (score <= 17) return "Low-level burnout";
    if (score >= 18 && score <= 29) return "Moderate burnout";
    if (score >= 30) return "High-level burnout";
    return "Invalid score";
  },
};

const DepersonalizationSection = {
  items: [
    {
      prefix: "",
      question:
        "I feel I look after certain patients/clients impersonally, as if they are objects.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I feel tired when I get up in the morning and have to face another day at work.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I have the impression that my patients/clients make me responsible for some of their problems.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I am at the end of my patience at the end of my work day.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I really don't care about what happens to some of my patients/clients.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I have become more insensitive to people since I've been working.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I'm afraid that this job is making me uncaring.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
  ],
  label: "Depersonalization",
  getSeverity: (score: number): string => {
    if (score <= 5) return "Low-level burnout";
    if (score >= 6 && score <= 11) return "Moderate burnout";
    if (score >= 12) return "High-level burnout";
    return "Invalid score";
  },
};

const PersonalAchievementSection = {
  items: [
    {
      prefix: "",
      question: "I accomplish many worthwhile things in this job.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I feel full of energy.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I am easily able to understand what my patients/clients feel.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "I look after my patients'/clients' problems very effectively.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question: "In my work, I handle emotional problems very calmly.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "Through my work, I feel that I have a positive influence on people.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I am easily able to create a relaxed atmosphere with my patients/clients.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      prefix: "",
      question:
        "I feel refreshed when I have been close to my patients/clients at work.",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
  ],
  label: "Personal Achievement",
  getSeverity: (score: number): string => {
    if (score <= 33) return "High-level burnout";
    if (score >= 34 && score <= 39) return "Moderate burnout";
    if (score >= 40) return "Low-level burnout";
    return "Invalid score";
  },
};

const getScaleScore = (answers: number[], items: any[]): number => {
  return items.reduce(
    (total: number, _, index: number) => total + (answers[index] || 0),
    0
  );
};

const MBI = {
  description:
    "The Maslach Burnout Inventory (MBI) is a self-assessment tool used to measure burnout risk. It evaluates three key components: Emotional Exhaustion, Depersonalization, and Personal Achievement. This tool should not be used as a formal diagnosis but as an awareness tool.",
  sections: {
    burnout: BurnoutSection.items,
    depersonalization: DepersonalizationSection.items,
    personalAchievement: PersonalAchievementSection.items,
  },
  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 },
    scales: {
      burnout: {
        items: BurnoutSection.items.map((_, index) => index),
        label: BurnoutSection.label,
      },
      depersonalization: {
        items: DepersonalizationSection.items.map((_, index) => index),
        label: DepersonalizationSection.label,
      },
      personalAchievement: {
        items: PersonalAchievementSection.items.map((_, index) => index),
        label: PersonalAchievementSection.label,
      },
    },
    getScaleScore: (
      answers: number[],
      scale: keyof typeof MBI.scoring.scales
    ): number => {
      const scaleItems = MBI.scoring.scales[scale]?.items;
      if (!scaleItems) return 0;

      return scaleItems.reduce(
        (total: number, index: number) => total + (answers[index] || 0),
        0
      );
    },
    getSeverity: (
      section: keyof typeof MBI.scoring.scales,
      score: number
    ): string => {
      if (section === "burnout") {
        return BurnoutSection.getSeverity(score);
      } else if (section === "depersonalization") {
        return DepersonalizationSection.getSeverity(score);
      } else if (section === "personalAchievement") {
        return PersonalAchievementSection.getSeverity(score);
      }
      return "Invalid score";
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess burnout risk. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you are experiencing symptoms of burnout, please seek support from a healthcare professional.",
};

export { BurnoutSection, DepersonalizationSection, PersonalAchievementSection };
export default MBI;
