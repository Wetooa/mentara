'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Heart,
  CheckCircle2,
  TrendingUp,
  Star,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ConversationMatchFactors {
  sentimentAlignment: number;
  mentionedConditionsMatch: number;
  preferenceAlignment: number;
  communicationStyleMatch: number;
  total: number;
}

interface ConversationExplanation {
  sentimentMatch: string;
  conditionMatches: string[];
  preferenceMatches: string[];
  communicationMatch: string;
}

interface MatchExplanationProps {
  matchScore: number;
  scoreBreakdown?: {
    conditionScore: number;
    approachScore: number;
    experienceScore: number;
    reviewScore: number;
    logisticsScore: number;
  };
  matchExplanation?: {
    primaryMatches: string[];
    secondaryMatches: string[];
    approachMatches: string[];
    experienceYears: number;
    averageRating: number;
    totalReviews: number;
  };
  conversationMatch?: {
    factors: ConversationMatchFactors;
    explanation: ConversationExplanation;
  };
  className?: string;
}

export function MatchExplanation({
  matchScore,
  scoreBreakdown,
  matchExplanation,
  conversationMatch,
  className = '',
}: MatchExplanationProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'outline' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Match Explanation
                <Badge variant={getScoreBadgeVariant(matchScore)} className="ml-2">
                  {matchScore}% Match
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Score Breakdown */}
            {scoreBreakdown && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Score Breakdown</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Conditions</span>
                      <span className={getScoreColor(scoreBreakdown.conditionScore)}>
                        {scoreBreakdown.conditionScore}%
                      </span>
                    </div>
                    <Progress value={scoreBreakdown.conditionScore} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Approaches</span>
                      <span className={getScoreColor(scoreBreakdown.approachScore)}>
                        {scoreBreakdown.approachScore}%
                      </span>
                    </div>
                    <Progress value={scoreBreakdown.approachScore} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Experience</span>
                      <span className={getScoreColor(scoreBreakdown.experienceScore)}>
                        {scoreBreakdown.experienceScore}%
                      </span>
                    </div>
                    <Progress value={scoreBreakdown.experienceScore} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Reviews</span>
                      <span className={getScoreColor(scoreBreakdown.reviewScore)}>
                        {scoreBreakdown.reviewScore}%
                      </span>
                    </div>
                    <Progress value={scoreBreakdown.reviewScore} className="h-1.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Insights */}
            {conversationMatch && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-gray-700">
                      Conversation-Based Matching
                    </h4>
                  </div>
                  
                  {conversationMatch.factors.total > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-900">
                          Conversation Match Score
                        </span>
                        <Badge variant="default" className="bg-blue-600">
                          {conversationMatch.factors.total}/60
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-blue-700">Sentiment: </span>
                          <span className="font-medium">{conversationMatch.factors.sentimentAlignment}/15</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Conditions: </span>
                          <span className="font-medium">{conversationMatch.factors.mentionedConditionsMatch}/20</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Preferences: </span>
                          <span className="font-medium">{conversationMatch.factors.preferenceAlignment}/15</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Communication: </span>
                          <span className="font-medium">{conversationMatch.factors.communicationStyleMatch}/10</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {conversationMatch.explanation.conditionMatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">
                        Conditions mentioned in conversation:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {conversationMatch.explanation.conditionMatches.map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {conversationMatch.explanation.preferenceMatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">
                        Therapy approaches you mentioned:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {conversationMatch.explanation.preferenceMatches.map((approach) => (
                          <Badge key={approach} variant="outline" className="text-xs">
                            {approach}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {conversationMatch.explanation.sentimentMatch && (
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-700">
                      <Heart className="h-3 w-3 inline mr-1 text-primary" />
                      {conversationMatch.explanation.sentimentMatch}
                    </div>
                  )}

                  {conversationMatch.explanation.communicationMatch && (
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-700">
                      <MessageSquare className="h-3 w-3 inline mr-1 text-primary" />
                      {conversationMatch.explanation.communicationMatch}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Traditional Match Factors */}
            {matchExplanation && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Match Factors</h4>
                  
                  {matchExplanation.primaryMatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Primary Conditions Matched:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchExplanation.primaryMatches.map((condition) => (
                          <Badge key={condition} variant="default" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchExplanation.secondaryMatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Secondary Conditions Matched:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchExplanation.secondaryMatches.map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchExplanation.approachMatches.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Therapeutic Approaches:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchExplanation.approachMatches.map((approach) => (
                          <Badge key={approach} variant="outline" className="text-xs">
                            {approach}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {matchExplanation.experienceYears} years experience
                      </span>
                    </div>
                    {matchExplanation.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-600">
                          {matchExplanation.averageRating.toFixed(1)} rating
                          {matchExplanation.totalReviews > 0 && (
                            <span className="text-gray-400">
                              {' '}({matchExplanation.totalReviews} reviews)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

