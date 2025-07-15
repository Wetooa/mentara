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
        severityLevels: Record<string, {
            range: [number, number];
            label: string;
        }>;
        getScore: (answers: number[]) => number;
        getSeverity: (score: number) => string;
    };
    disclaimer: string;
}
export declare const QUESTIONNAIRE_SCORING: QuestionnaireProps["scoring"];
//# sourceMappingURL=scoring.d.ts.map