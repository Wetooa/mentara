import { QuestionnaireProps } from "../scoring";
declare const PERCEIVED_STRESS_SCALE: QuestionnaireProps & {
    scoring: {
        reverseScoredQuestions: number[];
        reversedScoreMapping: Record<number, number>;
    } & QuestionnaireProps["scoring"];
};
export default PERCEIVED_STRESS_SCALE;
//# sourceMappingURL=perceived-stress-scale.d.ts.map