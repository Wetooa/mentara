import {
  type ListOfQuestionnaires,
  QUESTIONNAIRE_MAP,
} from "@/constants/questionnaire/questionnaire-mapping";

export interface FlatQuestion {
  originalIndex: number;
  sourceToolId: ListOfQuestionnaires;
  prefix: string;
  question: string;
  options: string[];
}

// Simple deterministic shuffle based on a seed string
export function seededShuffle<T>(array: T[], seed: string): T[] {
  let m = array.length, t, i;
  let seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const result = [...array];
  while (m) {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    i = Math.floor((seedNum / 233280) * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
}

/**
 * Gets the flattened, shuffled questions for a given session
 */
export function getFlatQuestions(questionnaires: ListOfQuestionnaires[], seed: string): FlatQuestion[] {
  if (questionnaires.length === 0) return [];

  const allQuestions: FlatQuestion[] = [];

  questionnaires.forEach(qName => {
    const qData = QUESTIONNAIRE_MAP[qName];
    if (qData && qData.questions) {
      qData.questions.forEach((q, index) => {
        allQuestions.push({
          originalIndex: index,
          sourceToolId: qName,
          prefix: q.prefix || qData.title || "Assessment",
          question: q.question,
          options: q.options
        });
      });
    }
  });

  return seededShuffle(allQuestions, seed);
}

export interface ToolResult {
  name: string;
  score: number;
  severity: string;
  percentage: number;
}

export function calculateDetailedResults(
  questionnaires: ListOfQuestionnaires[],
  flatAnswers: number[],
  seed: string
): ToolResult[] {
  const flatQuestions = getFlatQuestions(questionnaires, seed);
  
  // Group raw answers by their original index for each questionnaire
  const groupedRawAnswers: Record<string, number[]> = {};
  questionnaires.forEach(qName => {
      const toolLength = QUESTIONNAIRE_MAP[qName]?.questions?.length || 0;
      groupedRawAnswers[qName] = new Array(toolLength).fill(-1);
  });

  flatQuestions.forEach((q, index) => {
    const qName = q.sourceToolId as string;
    const answer = flatAnswers[index];
    if (answer !== undefined && groupedRawAnswers[qName]) {
      groupedRawAnswers[qName][q.originalIndex] = answer;
    }
  });

  return questionnaires.map(qName => {
    const qConfig = QUESTIONNAIRE_MAP[qName];
    if (!qConfig) {
       return { name: qName, score: 0, severity: 'Unknown', percentage: 0 };
    }

    const answers = groupedRawAnswers[qName];
    
    let totalScore = 0;
    let maxPossible = 0;
    const mapping = qConfig.scoring?.scoreMapping;
    
    // Calculate fallback totalScore and maxPossible
    answers.forEach((ans, idx) => {
        if (ans !== -1) {
            totalScore += mapping ? (mapping[ans] ?? 0) : ans;
        }
        const qOptionsLength = qConfig.questions[idx]?.options?.length || 4;
        const maxValPerQuestion = mapping 
            ? Math.max(...Object.values(mapping)) 
            : (qOptionsLength - 1);
        maxPossible += maxValPerQuestion;
    });

    // Check if the questionnaire defines custom score calculation
    if ('getScore' in qConfig.scoring && typeof (qConfig.scoring as { getScore?: (ans: number[]) => number }).getScore === 'function') {
        totalScore = (qConfig.scoring as { getScore: (ans: number[]) => number }).getScore(answers);
    } else if (typeof qConfig.scoring?.getScoreFromAnswers === 'function') {
        // If it overrides the default getScoreFromAnswers, we use it directly, but default getScoreFromAnswers is 
        // just a naive sum which ignores mapping. We will use it if it's provided since it might be customized.
        // Wait, for PHQ-9, we actually want mapping to apply. PHQ-9 doesn't override getScoreFromAnswers.
        // It relies on mapping. So if it doesn't override, our fallback totalScore computed above using mapping is correct!
        // So we only call it if it's explicitly useful. But let's trust our mapping loop for generic cases.
        // We'll leave totalScore as computed above unless there's a custom getScore.
    }

    let severityLabel = "Unknown";
    
    // Custom interpretations take precedence:
    if (typeof qConfig.scoring?.getInterpretationFromAnswers === 'function') {
        severityLabel = qConfig.scoring.getInterpretationFromAnswers(answers);
    } else if (typeof qConfig.scoring?.getInterpretationFromScore === 'function') {
        const dummyInterpretation = "Score: " + totalScore;
        const actualInterpretation = qConfig.scoring.getInterpretationFromScore(totalScore);
        if (actualInterpretation !== dummyInterpretation) {
            severityLabel = actualInterpretation;
        } else {
             // Fallback to severityLevels
            const severityLevels = qConfig.scoring?.severityLevels;
            if (severityLevels) {
              const level = Object.values(severityLevels).find(
                (l: { range: number[]; label: string }) => totalScore >= l.range[0] && totalScore <= l.range[1]
              );
              if (level) {
                severityLabel = level.label;
              }
            }
        }
    } else {
        // Fallback to severityLevels
        const severityLevels = qConfig.scoring?.severityLevels;
        if (severityLevels) {
          const level = Object.values(severityLevels).find(
            (l: { range: number[]; label: string }) => totalScore >= l.range[0] && totalScore <= l.range[1]
          );
          if (level) {
            severityLabel = level.label;
          }
        } else {
          // Fallback percentage
          const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;
          if (percentage > 75) severityLabel = "Significant Impact";
          else if (percentage > 35) severityLabel = "Moderate Impact";
          else severityLabel = "Low Impact";
        }
    }

    const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

    return {
      name: qName,
      score: totalScore,
      severity: severityLabel,
      percentage: percentage
    };
  });
}
