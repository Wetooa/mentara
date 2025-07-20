import { QuestionnaireProps } from "../scoring";
declare const MDQ: {
    scoring: {
        scoreThreshold: number;
        subscales: Record<string, number[]>;
    } & QuestionnaireProps["scoring"];
} & QuestionnaireProps;
export default MDQ;
//# sourceMappingURL=mood-disorder.d.ts.map