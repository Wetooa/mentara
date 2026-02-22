// Utility functions for pre-assessment scoring
// Based on the AI evaluation service 201-item questionnaire structure

export interface QuestionnaireScore {
  score: number;
  severity: string;
}

export interface QuestionnaireScores {
  [questionnaireName: string]: QuestionnaireScore;
}

export interface SeverityLevel {
  range: [number, number];
  label: string;
}

interface QuestionnaireConfig {
  scoreMapping: Record<number, number>;
  reverseScoredQuestions?: number[];
  severityLevels: Record<string, SeverityLevel>;
}

// Fixed questionnaire index mapping based on AI evaluation service
// Total: 201 items across 15 questionnaires
interface QuestionnaireIndexRange {
  startIndex: number;
  endIndex: number;
  itemCount: number;
}

export const LIST_OF_QUESTIONNAIRES = [
  'Stress',
  'Anxiety',
  'Depression',
  'Drug Abuse',
  'Insomnia',
  'Panic',
  'Bipolar disorder (BD)',
  'Obsessive compulsive disorder (OCD)',
  'Post-traumatic stress disorder (PTSD)',
  'Social anxiety',
  'Phobia',
  'Burnout',
  'Binge eating / Eating disorders',
  'ADD / ADHD',
  'Substance or Alcohol Use Issues',
] as const;

const QUESTIONNAIRE_INDEX_MAPPING: Record<string, QuestionnaireIndexRange> = {
  Depression: { startIndex: 0, endIndex: 14, itemCount: 15 }, // PHQ
  'ADD / ADHD': { startIndex: 15, endIndex: 32, itemCount: 18 }, // ASRS
  'Substance or Alcohol Use Issues': {
    startIndex: 33,
    endIndex: 42,
    itemCount: 10,
  }, // AUDIT
  'Binge eating / Eating disorders': {
    startIndex: 43,
    endIndex: 58,
    itemCount: 16,
  }, // BES
  'Drug Issues': { startIndex: 59, endIndex: 68, itemCount: 10 }, // DAST10
  Anxiety: { startIndex: 69, endIndex: 75, itemCount: 7 }, // GAD7
  Insomnia: { startIndex: 76, endIndex: 82, itemCount: 7 }, // ISI
  Burnout: { startIndex: 83, endIndex: 104, itemCount: 22 }, // MBI
  'Bipolar disorder (BD)': { startIndex: 105, endIndex: 119, itemCount: 15 }, // MDQ
  'Obsessive compulsive disorder (OCD)': {
    startIndex: 120,
    endIndex: 137,
    itemCount: 18,
  }, // OCI_R
  'Post-traumatic stress disorder (PTSD)': {
    startIndex: 138,
    endIndex: 157,
    itemCount: 20,
  }, // PCL5
  Panic: { startIndex: 158, endIndex: 164, itemCount: 7 }, // PDSS
  'Depression Secondary': { startIndex: 165, endIndex: 173, itemCount: 9 }, // PHQ9
  Stress: { startIndex: 174, endIndex: 183, itemCount: 10 }, // PSS
  'Social anxiety': { startIndex: 184, endIndex: 200, itemCount: 17 }, // SPIN
};

// Questionnaire scoring configurations
export const QUESTIONNAIRE_SCORING: Record<string, QuestionnaireConfig> = {
  Stress: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      low: { range: [0, 13], label: 'Low Stress' },
      moderate: { range: [14, 26], label: 'Moderate Stress' },
      high: { range: [27, 40], label: 'High Stress' },
    },
  },
  Anxiety: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 4], label: 'Minimal' },
      mild: { range: [5, 9], label: 'Mild' },
      moderate: { range: [10, 14], label: 'Moderate' },
      severe: { range: [15, 21], label: 'Severe' },
    },
  },
  Depression: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      none: { range: [0, 0], label: 'No Phobia' },
      mildModerate: { range: [1, 15], label: 'Mild-Moderate' },
      moderateSevere: { range: [16, 25], label: 'Moderate-Severe' },
      verySevere: { range: [26, 120], label: 'Very Severe' },
    },
  },
  Insomnia: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 7], label: 'No Insomnia' },
      subthreshold: { range: [8, 14], label: 'Subthreshold Insomnia' },
      moderate: { range: [15, 21], label: 'Moderate Insomnia' },
      severe: { range: [22, 28], label: 'Severe Insomnia' },
    },
  },
  Panic: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      minimal: { range: [0, 7], label: 'Minimal' },
      mild: { range: [8, 10], label: 'Mild' },
      moderate: { range: [11, 15], label: 'Moderate' },
      severe: { range: [16, 28], label: 'Severe' },
    },
  },
  'Bipolar disorder (BD)': {
    scoreMapping: { 0: 0, 1: 1 },
    severityLevels: {
      negative: { range: [0, 0], label: 'Negative Screen' },
      positive: { range: [1, 1], label: 'Positive Bipolar Screen (All 3 Criteria Met)' },
    },
  },
  'Obsessive compulsive disorder (OCD)': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      below: { range: [0, 20], label: 'Below Threshold' },
      clinical: { range: [21, 72], label: 'Clinical Range' },
    },
  },
  'Post-traumatic stress disorder (PTSD)': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      below: { range: [0, 32], label: 'Below Threshold' },
      probable: { range: [33, 80], label: 'Probable PTSD' },
    },
  },
  'Social anxiety': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      below: { range: [0, 33], label: 'Below Threshold' },
      specific: { range: [34, 42], label: 'Social anxiety specific (Potential Social Phobia)' },
      generalized: { range: [43, 80], label: 'Generalized Social Interaction Anxiety' },
    },
  },
  Phobia: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 20], label: 'No significant phobia' },
      mild: { range: [21, 40], label: 'Mild phobia' },
      moderate: { range: [41, 60], label: 'Moderate phobia' },
      severe: { range: [61, 80], label: 'Severe phobia' },
      extreme: { range: [81, 100], label: 'Extreme phobia' },
    },
  },
  Burnout: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 },
    severityLevels: {
      interpretation: { range: [0, 100], label: 'MBI Scale' },
    },
  },
  'Binge eating / Eating disorders': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      minimal: { range: [0, 17], label: 'Minimal/No Binge Eating' },
      mildModerate: { range: [18, 26], label: 'Mild to moderate binge eating' },
      severe: { range: [27, 46], label: 'Severe binge eating' },
    },
  },
  'ADD / ADHD': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      low: { range: [0, 30], label: 'Low' },
      mildModerate: { range: [31, 39], label: 'Mild to Moderate' },
      high: { range: [40, 49], label: 'High' },
      veryHigh: { range: [50, 72], label: 'Very High' },
      screenPositive: { range: [100, 100], label: 'Highly Consistent with Adult ADHD (Screen Positive)' },
      screenNegative: { range: [101, 101], label: 'Below Clinical Screening Threshold' },
    },
  },
  'Substance or Alcohol Use Issues': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      low: { range: [0, 7], label: 'Low Risk' },
      hazardous: { range: [8, 15], label: 'Hazardous' },
      harmful: { range: [16, 19], label: 'Harmful' },
      dependent: { range: [20, 40], label: 'Dependent' },
    },
  },
  'Drug Issues': {
    scoreMapping: { 0: 0, 1: 1 },
    severityLevels: {
      none: { range: [0, 0], label: 'No Problems' },
      low: { range: [1, 2], label: 'Low Level' },
      moderate: { range: [3, 5], label: 'Moderate Level' },
      substantial: { range: [6, 8], label: 'Substantial Level' },
      severe: { range: [9, 10], label: 'Severe Level' },
    },
  },
  'Depression Secondary': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 4], label: 'Minimal' },
      mild: { range: [5, 9], label: 'Mild' },
      moderate: { range: [10, 14], label: 'Moderate' },
      moderatelySevere: { range: [15, 19], label: 'Moderately Severe' },
      severe: { range: [20, 27], label: 'Severe' },
    },
  },
};

export function calculateQuestionnaireScore(
  questionnaireName: string,
  answers: number[],
): QuestionnaireScore & { subscales?: Record<string, number> } {
  const config = QUESTIONNAIRE_SCORING[questionnaireName];
  if (!config) {
    return { score: 0, severity: 'Unknown questionnaire' };
  }

  let totalScore = 0;

  // ASRS Special Scoring Logic
  if (questionnaireName === 'ADD / ADHD') {
    const shadedRules: Record<string, number[]> = {
      '0': [2, 3, 4], '1': [2, 3, 4], '2': [2, 3, 4],
      '3': [3, 4], '4': [3, 4], '5': [3, 4],
      '6': [3, 4], '7': [3, 4], '8': [2, 3, 4],
      '9': [3, 4], '10': [3, 4], '11': [2, 3, 4],
      '12': [3, 4], '13': [3, 4], '14': [3, 4],
      '15': [2, 3, 4], '16': [3, 4], '17': [2, 3, 4]
    };

    // Calculate total score (0-72)
    const rawTotal = answers.reduce((sum, val) => sum + (val === -1 ? 0 : val), 0);

    // Screening Rule: 4 or more scores in shaded boxes of Part A (items 1-6)
    let partAShadedCount = 0;
    for (let i = 0; i < 6; i++) {
      if (answers[i] !== -1 && shadedRules[i].includes(answers[i])) {
        partAShadedCount++;
      }
    }

    let severity = 'Below Clinical Screening Threshold';
    if (partAShadedCount >= 4) {
      severity = 'Highly Consistent with Adult ADHD (Screen Positive)';
    } else {
      // Use conventional thresholds if screen is negative but total is high?
      // ClinicalScorer says: if part_a >= 4 positive else negative.
      // But it also has thresholds (0, 30, 'Low'), etc.
      for (const [, range] of Object.entries(config.severityLevels)) {
        if (rawTotal >= range.range[0] && rawTotal <= range.range[1]) {
          severity = range.label;
          break;
        }
      }
    }

    return { score: rawTotal, severity };
  }

  // MBI Special Scoring Logic
  if (questionnaireName === 'Burnout') {
    const subscales: Record<string, number> = { EE: 0, DP: 0, PA: 0 };
    // MBI Item mapping: EE (1,2,3,4,5,6,7), DP (8,9,10,11,12,13,14), PA (15,16,17,18,19,20,21,22)
    // Note: Items 0-21 in answers array
    for (let i = 0; i < answers.length; i++) {
      const val = answers[i] === -1 ? 0 : answers[i];
      if (i < 7) subscales.EE += val;
      else if (i < 14) subscales.DP += val;
      else subscales.PA += val;
    }

    const eeLevel = subscales.EE <= 16 ? "Low" : (subscales.EE <= 26 ? "Moderate" : "High");
    const dpLevel = subscales.DP <= 6 ? "Low" : (subscales.DP <= 12 ? "Moderate" : "High");
    const paLevel = subscales.PA >= 39 ? "High Accomplishment" : (subscales.PA >= 32 ? "Moderate" : "Low Accomplishment");

    return {
      score: subscales.EE + subscales.DP + subscales.PA,
      severity: `EE: ${eeLevel}, DP: ${dpLevel}, PA: ${paLevel}`,
      subscales
    };
  }

  // MDQ Special Scoring Logic
  if (questionnaireName === 'Bipolar disorder (BD)') {
    // 1. 7+ Yes in questions 0-12 (Yes=1)
    const symptomCount = answers.slice(0, 13).filter(a => a === 1).length;
    // 2. Symptom clustering (Question 13)
    const clustering = answers[13] === 1;
    // 3. Moderate/Serious problem (Question 14 >= 2)
    const impairment = answers[14] >= 2;

    const positive = symptomCount >= 7 && clustering && impairment;
    return {
      score: positive ? 1 : 0,
      severity: positive ? 'Positive Bipolar Screen (All 3 Criteria Met)' : 'Negative Screen'
    };
  }

  // Default Scoring Logic
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (answer === -1 || answer === undefined) continue;

    if (config.scoreMapping && config.scoreMapping[answer] !== undefined) {
      totalScore += config.scoreMapping[answer];
    } else {
      totalScore += answer;
    }
  }

  // PHQ/PSS specific logic (if needed, but ClinicalScorer says labels are "No Phobia" etc)
  // We'll stick to the SEVERITY_THRESHOLDS exactly.

  let severity = 'Unknown severity';
  for (const [, range] of Object.entries(config.severityLevels)) {
    if (totalScore >= range.range[0] && totalScore <= range.range[1]) {
      severity = range.label;
      break;
    }
  }

  return { score: totalScore, severity };
}

// New function to work with flat array of 201 responses
export function calculateAllScoresFromFlatArray(
  flatAnswers: number[],
): QuestionnaireScores {
  if (flatAnswers.length !== 201) {
    throw new Error(`Expected 201 responses, got ${flatAnswers.length}`);
  }

  const scores: QuestionnaireScores = {};

  // Calculate scores for each questionnaire using fixed index ranges
  for (const [questionnaireName, indexRange] of Object.entries(
    QUESTIONNAIRE_INDEX_MAPPING,
  )) {
    const questionnaireAnswers = flatAnswers.slice(
      indexRange.startIndex,
      indexRange.endIndex + 1,
    );

    if (questionnaireAnswers.length === indexRange.itemCount) {
      scores[questionnaireName] = calculateQuestionnaireScore(
        questionnaireName,
        questionnaireAnswers,
      );
    }
  }

  return scores;
}

// Legacy function for backward compatibility - now deprecated
export function calculateAllScores(
  questionnaires: string[],
  answers: number[][],
): QuestionnaireScores {
  const scores: QuestionnaireScores = {};

  for (let i = 0; i < questionnaires.length; i++) {
    const questionnaireName = questionnaires[i];
    const questionnaireAnswers = answers[i];

    if (questionnaireAnswers && questionnaireAnswers.length > 0) {
      scores[questionnaireName] = calculateQuestionnaireScore(
        questionnaireName,
        questionnaireAnswers,
      );
    }
  }

  return scores;
}

export function generateSeverityLevels(
  scores: QuestionnaireScores,
): Record<string, string> {
  const severityLevels: Record<string, string> = {};

  for (const [questionnaireName, scoreData] of Object.entries(scores)) {
    severityLevels[questionnaireName] = scoreData.severity;
  }

  return severityLevels;
}

/**
 * Helper function to process flat answers and generate scores and severity levels
 * This eliminates code duplication across services
 */
export function processPreAssessmentAnswers(flatAnswers: number[]): {
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
} {
  const calculatedScores = calculateAllScoresFromFlatArray(flatAnswers);

  const scores = Object.fromEntries(
    Object.entries(calculatedScores).map(([key, value]) => [key, value.score]),
  );

  const severityLevels = generateSeverityLevels(calculatedScores);

  return { scores, severityLevels };
}
