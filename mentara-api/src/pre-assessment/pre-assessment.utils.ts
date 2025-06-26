// Utility functions for pre-assessment scoring
// Based on the frontend questionnaire structure

export interface QuestionnaireScore {
  score: number;
  severity: string;
}

export interface QuestionnaireScores {
  [questionnaireName: string]: QuestionnaireScore;
}

interface SeverityLevel {
  range: [number, number];
  label: string;
}

interface QuestionnaireConfig {
  scoreMapping: Record<number, number>;
  reverseScoredQuestions?: number[];
  severityLevels: Record<string, SeverityLevel>;
}

// Questionnaire scoring configurations
const QUESTIONNAIRE_SCORING: Record<string, QuestionnaireConfig> = {
  Stress: {
    scoreMapping: { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0 },
    reverseScoredQuestions: [3, 4, 6, 7],
    severityLevels: {
      low: { range: [0, 13], label: 'Low Stress' },
      moderate: { range: [14, 26], label: 'Moderate Stress' },
      high: { range: [27, 40], label: 'High Perceived Stress' },
    },
  },
  Anxiety: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 4], label: 'Minimal Anxiety' },
      mild: { range: [5, 9], label: 'Mild Anxiety' },
      moderate: { range: [10, 14], label: 'Moderate Anxiety' },
      severe: { range: [15, 21], label: 'Severe Anxiety' },
    },
  },
  Depression: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 4], label: 'Minimal Depression' },
      mild: { range: [5, 9], label: 'Mild Depression' },
      moderate: { range: [10, 14], label: 'Moderate Depression' },
      moderatelySevere: {
        range: [15, 19],
        label: 'Moderately Severe Depression',
      },
      severe: { range: [20, 27], label: 'Severe Depression' },
    },
  },
  Insomnia: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 7], label: 'No clinically significant insomnia' },
      subthreshold: { range: [8, 14], label: 'Subthreshold insomnia' },
      moderate: {
        range: [15, 21],
        label: 'Clinical insomnia (moderate severity)',
      },
      severe: { range: [22, 28], label: 'Clinical insomnia (severe)' },
    },
  },
  Panic: {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 7], label: 'No panic disorder' },
      mild: { range: [8, 15], label: 'Mild panic disorder' },
      moderate: { range: [16, 23], label: 'Moderate panic disorder' },
      severe: { range: [24, 40], label: 'Severe panic disorder' },
    },
  },
  'Bipolar disorder (BD)': {
    scoreMapping: { 0: 0, 1: 1, 2: 2 },
    severityLevels: {
      negative: { range: [0, 6], label: 'Negative for bipolar disorder' },
      positive: { range: [7, 13], label: 'Positive for bipolar disorder' },
    },
  },
  'Obsessive compulsive disorder (OCD)': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      subclinical: { range: [0, 20], label: 'Subclinical' },
      mild: { range: [21, 40], label: 'Mild' },
      moderate: { range: [41, 60], label: 'Moderate' },
      severe: { range: [61, 80], label: 'Severe' },
      extreme: { range: [81, 100], label: 'Extreme' },
    },
  },
  'Post-traumatic stress disorder (PTSD)': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 10], label: 'None to minimal' },
      mild: { range: [11, 20], label: 'Mild' },
      moderate: { range: [21, 30], label: 'Moderate' },
      severe: { range: [31, 40], label: 'Severe' },
      extreme: { range: [41, 80], label: 'Extreme' },
    },
  },
  'Social anxiety': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      minimal: { range: [0, 20], label: 'Minimal or No Social Phobia' },
      mild: { range: [21, 30], label: 'Mild Social Phobia' },
      moderate: { range: [31, 40], label: 'Moderate Social Phobia' },
      severe: { range: [41, 50], label: 'Severe Social Phobia' },
      verySevere: { range: [51, 68], label: 'Very Severe Social Phobia' },
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
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      low: { range: [0, 30], label: 'Low burnout' },
      moderate: { range: [31, 50], label: 'Moderate burnout' },
      high: { range: [51, 70], label: 'High burnout' },
      severe: { range: [71, 100], label: 'Severe burnout' },
    },
  },
  'Binge eating / Eating disorders': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 17], label: 'No binge eating' },
      mild: { range: [18, 26], label: 'Mild binge eating' },
      moderate: { range: [27, 46], label: 'Moderate binge eating' },
      severe: { range: [47, 100], label: 'Severe binge eating' },
    },
  },
  'ADD / ADHD': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 16], label: 'No ADHD symptoms' },
      mild: { range: [17, 23], label: 'Mild ADHD symptoms' },
      moderate: { range: [24, 30], label: 'Moderate ADHD symptoms' },
      severe: { range: [31, 36], label: 'Severe ADHD symptoms' },
    },
  },
  'Substance or Alcohol Use Issues': {
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    severityLevels: {
      none: { range: [0, 7], label: 'No significant alcohol use' },
      mild: { range: [8, 15], label: 'Mild alcohol use' },
      moderate: { range: [16, 19], label: 'Moderate alcohol use' },
      severe: { range: [20, 40], label: 'Severe alcohol use' },
    },
  },
};

export function calculateQuestionnaireScore(
  questionnaireName: string,
  answers: number[],
): QuestionnaireScore {
  const config = QUESTIONNAIRE_SCORING[questionnaireName];
  if (!config) {
    return { score: 0, severity: 'Unknown questionnaire' };
  }

  let score = 0;

  // Calculate score based on answers
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (answer === -1 || answer === undefined) continue; // Skip unanswered questions

    let questionScore = config.scoreMapping[answer] || 0;

    // Handle reverse scoring for specific questionnaires
    if (
      questionnaireName === 'Stress' &&
      config.reverseScoredQuestions?.includes(i)
    ) {
      questionScore = 4 - questionScore; // Reverse the score
    }

    score += questionScore;
  }

  // Determine severity level
  let severity = 'Unknown severity';
  for (const [level, range] of Object.entries(config.severityLevels)) {
    const severityRange = range as { range: [number, number]; label: string };
    if (score >= severityRange.range[0] && score <= severityRange.range[1]) {
      severity = severityRange.label;
      break;
    }
  }

  return { score, severity };
}

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
