'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertTriangle,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AssessmentResults {
  method: 'checklist' | 'chatbot';
  scores: Record<string, { score: number; severity: string; subscales?: Record<string, number> }>;
  severityLevels: Record<string, string>;
  answers?: number[];
  conversationInsights?: any;
  preAssessment?: {
    recommendations?: {
      expertise?: string[];
      illnessSpecializations?: string[];
      areasOfExpertise?: string[];
      primaryConditions?: string[];
    };
  };
}

interface PreAssessmentResultsProps {
  results: AssessmentResults | null;
  onReset: () => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'minimal':
    case 'low':
    case 'subclinical':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'mild':
    case 'subthreshold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'moderate':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'moderately severe':
    case 'severe':
    case 'very severe':
    case 'extreme':
    case 'high':
    case 'clinical':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export function PreAssessmentResults({ results, onReset }: PreAssessmentResultsProps) {
  if (!results) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">No results available</p>
        <Button onClick={onReset} className="mt-4" variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start Over
        </Button>
      </div>
    );
  }

  const scoreEntries = Object.entries(results.scores);
  const severityEntries = Object.entries(results.severityLevels);

  return (
    <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold">Assessment Complete</h2>
        </div>
        <p className="text-sm text-gray-600">
          Results from {results.method === 'chatbot' ? 'Chatbot' : 'Checklist'} assessment
        </p>
        <Badge variant="secondary" className="mt-2">
          {results.method === 'chatbot' ? (
            <MessageSquare className="h-3 w-3 mr-1" />
          ) : (
            <FileText className="h-3 w-3 mr-1" />
          )}
          {results.method === 'chatbot' ? 'Chatbot Mode' : 'Checklist Mode'}
        </Badge>
      </div>

      <Separator />

      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="severity">Severity</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-4 mt-4">
          {scoreEntries.length > 0 ? (
            scoreEntries.map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{key}</CardTitle>
                    <Badge variant="outline" className="font-mono">
                      {value.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={Math.min(100, value.score)} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Score: {value.score}</span>
                    <Badge
                      variant="outline"
                      className={getSeverityColor(value.severity)}
                    >
                      {value.severity}
                    </Badge>
                  </div>
                  {value.subscales && Object.keys(value.subscales).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(value.subscales).map(([subKey, subVal]) => (
                        <div key={subKey} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded border">
                          <span className="font-semibold text-gray-700">{subKey}:</span>
                          <span className="text-gray-900">{subVal}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No scores available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Severity Levels Tab */}
        <TabsContent value="severity" className="space-y-4 mt-4">
          {severityEntries.length > 0 ? (
            severityEntries.map(([key, severity]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{key}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant="outline"
                    className={`${getSeverityColor(severity)} text-sm px-3 py-1`}
                  >
                    {severity}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No severity levels available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 mt-4">
          {results.preAssessment?.recommendations ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    Matching Criteria
                  </CardTitle>
                  <CardDescription>
                    Deterministic query criteria used to match this user with therapists (No AI used).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Primary Conditions Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.preAssessment.recommendations.primaryConditions?.map((c, i) => (
                        <Badge key={i} variant="secondary">{c}</Badge>
                      )) || <span className="text-sm text-gray-500">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Therapist Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.preAssessment.recommendations.expertise?.map((e, i) => (
                        <Badge key={i} className="bg-blue-100 text-blue-800 border-blue-200">{e}</Badge>
                      )) || <span className="text-sm text-gray-500">None</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Illness Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.preAssessment.recommendations.illnessSpecializations?.map((s, i) => (
                        <Badge key={i} className="bg-purple-100 text-purple-800 border-purple-200">{s}</Badge>
                      )) || <span className="text-sm text-gray-500">None</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Areas of Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.preAssessment.recommendations.areasOfExpertise?.map((a, i) => (
                        <Badge key={i} className="bg-green-100 text-green-800 border-green-200">{a}</Badge>
                      )) || <span className="text-sm text-gray-500">None</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No recommendation criteria available for this assessment.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Raw Data Tab */}
        <TabsContent value="raw" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Raw Assessment Data
              </CardTitle>
              <CardDescription>
                Complete JSON output from the assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {results.answers && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Answer Array</CardTitle>
                <CardDescription>
                  {results.answers.length} total answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-gray-700">
                    [{results.answers.join(', ')}]
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {results.conversationInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(results.conversationInsights, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onReset} variant="outline" className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Test Again
        </Button>
        <Button
          onClick={() => {
            const dataStr = JSON.stringify(results, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pre-assessment-results-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          variant="secondary"
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </div>
    </div>
  );
}

