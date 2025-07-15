export interface QuestionnaireProps {
  title: string;
  description: string;
  questions: {
    prefix: string;
    question: string;
    options: string[];
  }[];
  scoring: {
    scoreMapping: Record<number, number>;
    severityLevels: Record<string, { range: [number, number]; label: string }>;
    getScore: (answers: number[]) => number;
    getSeverity: (score: number) => string;
  };
  disclaimer: string;
}

export const QUESTIONNAIRE_SCORING: QuestionnaireProps["scoring"] = {
  scoreMapping: {},
  severityLevels: {},
  getScore: function (answers: number[]): number {
    return answers.reduce(
      (total, answer) => total + (this.scoreMapping[answer] || 0),
      0
    );
  },
  getSeverity: function (score: number): string {
    for (const level in this.severityLevels) {
      const severityLevel = this.severityLevels[level];
      if (severityLevel && score >= severityLevel.range[0] && score <= severityLevel.range[1]) {
        return severityLevel.label;
      }
    }

    return "Invalid score";
  },
};
