'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { LIST_OF_QUESTIONNAIRES } from '@/constants/questionnaire/questionnaire-mapping';

interface QuestionnaireProgressProps {
  currentQuestionnaire: string | null;
  completedQuestionnaires: string[];
  suggestedQuestionnaires?: string[];
}

export function QuestionnaireProgress({
  currentQuestionnaire,
  completedQuestionnaires,
  suggestedQuestionnaires = [],
}: QuestionnaireProgressProps) {
  const allQuestionnaires = LIST_OF_QUESTIONNAIRES;
  const totalCount = allQuestionnaires.length;
  const completedCount = completedQuestionnaires.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const getQuestionnaireStatus = (questionnaire: string) => {
    if (completedQuestionnaires.includes(questionnaire)) {
      return 'completed';
    }
    if (currentQuestionnaire === questionnaire) {
      return 'current';
    }
    if (suggestedQuestionnaires.includes(questionnaire)) {
      return 'suggested';
    }
    return 'pending';
  };

  return (
    <div className="space-y-4 p-4 bg-white/50 rounded-lg border border-primary/10">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Assessment Progress</h4>
        <Badge variant="secondary" className="text-xs">
          {completedCount} / {totalCount} completed
        </Badge>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      {currentQuestionnaire && (
        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md border border-primary/20">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-sm font-medium text-primary">
            Currently assessing: <strong>{currentQuestionnaire}</strong>
          </span>
        </div>
      )}

      {suggestedQuestionnaires.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Suggested Questionnaires:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestionnaires.slice(0, 5).map((q) => (
              <Badge
                key={q}
                variant={getQuestionnaireStatus(q) === 'suggested' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {q}
              </Badge>
            ))}
            {suggestedQuestionnaires.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{suggestedQuestionnaires.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-32 overflow-y-auto">
        {allQuestionnaires.slice(0, 8).map((questionnaire) => {
          const status = getQuestionnaireStatus(questionnaire);
          return (
            <div
              key={questionnaire}
              className="flex items-center gap-2 text-xs text-gray-600"
            >
              {status === 'completed' && (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              )}
              {status === 'current' && (
                <Loader2 className="h-3 w-3 text-primary animate-spin" />
              )}
              {status === 'pending' && (
                <Circle className="h-3 w-3 text-gray-300" />
              )}
              <span
                className={
                  status === 'completed'
                    ? 'text-green-700 line-through'
                    : status === 'current'
                    ? 'text-primary font-medium'
                    : 'text-gray-500'
                }
              >
                {questionnaire}
              </span>
            </div>
          );
        })}
        {allQuestionnaires.length > 8 && (
          <p className="text-xs text-gray-400 italic">
            +{allQuestionnaires.length - 8} more questionnaires
          </p>
        )}
      </div>
    </div>
  );
}

