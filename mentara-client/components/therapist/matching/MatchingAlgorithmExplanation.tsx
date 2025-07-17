'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  ChevronDown, 
  Brain, 
  Target, 
  Star, 
  Clock, 
  MapPin, 
  Heart,
  Users,
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchingFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  icon: React.ElementType;
  examples: string[];
}

interface MatchingAlgorithmExplanationProps {
  matchingScore?: number;
  therapistId?: string;
  className?: string;
  compact?: boolean;
}

const matchingFactors: MatchingFactor[] = [
  {
    id: 'specialties',
    name: 'Treatment Specialties',
    description: 'How well the therapist\'s specialties match your specific needs',
    weight: 35,
    icon: Brain,
    examples: ['Anxiety & Depression', 'Trauma & PTSD', 'Relationship Issues', 'Addiction Recovery']
  },
  {
    id: 'approaches',
    name: 'Therapy Approaches',
    description: 'Alignment with your preferred therapeutic methods',
    weight: 25,
    icon: Target,
    examples: ['Cognitive Behavioral Therapy (CBT)', 'EMDR', 'Mindfulness-Based Therapy', 'Psychodynamic']
  },
  {
    id: 'experience',
    name: 'Experience & Expertise',
    description: 'Years of practice and relevant certifications',
    weight: 20,
    icon: Award,
    examples: ['10+ years experience', 'Board certified', 'Specialized training', 'Published research']
  },
  {
    id: 'availability',
    name: 'Schedule Compatibility',
    description: 'How well their availability matches your preferred times',
    weight: 10,
    icon: Calendar,
    examples: ['Evening sessions', 'Weekend availability', 'Flexible scheduling', 'Same-day appointments']
  },
  {
    id: 'location',
    name: 'Location & Format',
    description: 'Proximity and session format preferences',
    weight: 5,
    icon: MapPin,
    examples: ['In-person sessions', 'Video calls', 'Within 10 miles', 'Public transport accessible']
  },
  {
    id: 'budget',
    name: 'Cost & Insurance',
    description: 'Alignment with your budget and insurance coverage',
    weight: 5,
    icon: DollarSign,
    examples: ['Insurance accepted', 'Sliding scale fees', 'Within budget range', 'No upfront costs']
  }
];

export function MatchingAlgorithmExplanation({ 
  matchingScore, 
  therapistId, 
  className,
  compact = false 
}: MatchingAlgorithmExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());

  const toggleFactor = (factorId: string) => {
    const newExpanded = new Set(expandedFactors);
    if (newExpanded.has(factorId)) {
      newExpanded.delete(factorId);
    } else {
      newExpanded.add(factorId);
    }
    setExpandedFactors(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    return 'Potential Match';
  };

  if (compact) {
    return (
      <Card className={cn('border border-border/50', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Matching Algorithm</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              How it works
            </Button>
          </div>
          
          {matchingScore && (
            <div className="mt-2">
              <Badge className={cn('text-xs', getScoreColor(matchingScore))}>
                {matchingScore}% {getScoreLabel(matchingScore)}
              </Badge>
            </div>
          )}

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3">
                Our algorithm considers multiple factors to find your best therapeutic match:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {matchingFactors.slice(0, 4).map((factor) => {
                  const Icon = factor.icon;
                  return (
                    <div key={factor.id} className="flex items-center gap-2">
                      <Icon className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {factor.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border border-border/50', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">How We Match You</CardTitle>
        </div>
        <CardDescription>
          Our intelligent algorithm analyzes multiple factors to find therapists who best fit your unique needs and preferences.
        </CardDescription>
        
        {matchingScore && (
          <div className="flex items-center gap-2 pt-2">
            <Badge className={cn('text-sm', getScoreColor(matchingScore))}>
              <Star className="h-3 w-3 mr-1" />
              {matchingScore}% {getScoreLabel(matchingScore)}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          We use a weighted scoring system that prioritizes the most important factors for therapeutic success:
        </div>

        <div className="space-y-3">
          {matchingFactors.map((factor) => {
            const Icon = factor.icon;
            const isExpanded = expandedFactors.has(factor.id);

            return (
              <div key={factor.id} className="border border-border/50 rounded-lg">
                <button
                  onClick={() => toggleFactor(factor.id)}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{factor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {factor.weight}% weight in matching
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isExpanded && "transform rotate-180"
                    )} />
                  </div>
                </button>

                <Collapsible open={isExpanded}>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="pl-11 space-y-3 border-l-2 border-border/50 ml-4">
                      <p className="text-sm text-muted-foreground">
                        {factor.description}
                      </p>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Examples include:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {factor.examples.map((example, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs border-primary/20 text-primary"
                            >
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
            <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-primary mb-1">
                Personalized for You
              </div>
              <div className="text-muted-foreground text-xs">
                Your matching scores are calculated based on your assessment responses, 
                preferences, and goals to ensure the most compatible therapeutic relationship.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Based on 10,000+ successful matches</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated in real-time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MatchingAlgorithmExplanation;