import { calculateQuestionnaireScore } from './pre-assessment.utils';

describe('PreAssessmentUtils - calculateQuestionnaireScore', () => {
    it('should calculate PHQ-9 score correctly', () => {
        // 9 questions, sum of answers
        const answers = [1, 2, 3, 0, 1, 2, 3, 0, 1]; // Total: 13
        const result = calculateQuestionnaireScore('Depression Secondary', answers);
        expect(result.score).toBe(13);
        expect(result.severity).toBe('Moderate');
    });

    it('should calculate ASRS score correctly (Part A screening)', () => {
        // ASRS: 18 questions. Custom rule for positive screen: 4+ in shaded boxes of Part A (first 6 questions)
        // Shaded: questions 1-3 (answers 2,3,4) & 4-6 (answers 3,4)
        // 4+ shaded = Positive Screen
        const answers = [
            3, 3, 3, 3, 0, 0, // Part A: 1st four are shaded -> 4 shaded answers. Total Part A: 12
            ...Array(12).fill(0) // Part B: all 0s. Total: 12
        ];
        const result = calculateQuestionnaireScore('ADD / ADHD', answers);
        expect(result.score).toBe(12);
        expect(result.severity).toBe('Highly Consistent with Adult ADHD (Screen Positive)');
    });

    it('should calculate MDQ score correctly (3-criteria met)', () => {
        // MDQ: 15 questions. 1-13 (Yes=1), 14 (Yes=1), 15 (Moderate=2, Serious=3)
        // Positive if >= 7 Yes in 1-13 AND Yes in 14 AND >= 2 in 15
        const answers = [
            1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 7 Yes
            1, // Clustering = Yes
            3  // Impairment = Serious
        ];
        const result = calculateQuestionnaireScore('Bipolar disorder (BD)', answers);
        expect(result.score).toBe(1); // Score is boolean representing positive screen 
        expect(result.severity).toBe('Positive Bipolar Screen (All 3 Criteria Met)');
    });

    it('should calculate MBI score correctly (Subscales)', () => {
        // MBI: 22 questions. 1-9 (EE), 10-14 (DP), 15-22 (PA)
        // EE (1-9): answers 0-6. sum=0
        // DP (10-14): answers 0-6. sum=0
        // PA (15-22): answers 0-6. sum=8*6=48
        const answers = [
            ...Array(9).fill(0), // EE total 0 -> Low
            ...Array(5).fill(0), // DP total 0 -> Low
            ...Array(8).fill(6)  // PA total 48 -> High Accomplishment
        ];
        const result = calculateQuestionnaireScore('Burnout', answers);
        expect(result.subscales).toBeDefined();
        expect(result.subscales?.EE).toBe(0);
        expect(result.subscales?.DP).toBe(0);
        expect(result.subscales?.PA).toBe(48);
        expect(result.severity).toBe('EE: Low, DP: Low, PA: High Accomplishment');
        expect(result.score).toBe(48);
    });
});
