'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TestTube, CheckCircle2, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/Logo';
import PreAssessmentInitialCheckList from '@/components/pre-assessment/forms/ChecklistForm';
import QuestionnaireForm from '@/components/pre-assessment/forms/QuestionnaireForm';
import ChatbotInterface from '@/components/pre-assessment/ChatbotInterface';
import PreAssessmentProgressBar from '@/components/pre-assessment/ProgressBar';
import { usePreAssessment } from '@/hooks/pre-assessment/usePreAssessment';
import { usePreAssessmentChecklistStore } from '@/store/pre-assessment';
import { fadeDown } from '@/lib/animations';
import { usePreAssessmentService } from '@/hooks/pre-assessment/usePreAssessmentService';
import { PreAssessmentResults } from './PreAssessmentResults';

type Mode = 'selection' | 'checklist' | 'chatbot' | 'results';

interface AssessmentResults {
  method: 'checklist' | 'chatbot';
  scores: Record<string, { score: number; severity: string }>;
  severityLevels: Record<string, string>;
  answers?: number[];
  conversationInsights?: any;
  preAssessment?: any;
}

export default function PreAssessmentTester() {
  const [mode, setMode] = useState<Mode>('selection');
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const { setQuestionnaires, nextStep } = usePreAssessmentChecklistStore();
  const { service } = usePreAssessmentService();
  const {
    step,
    questionnaires,
    animationControls,
    handlePrevButtonOnClick,
    handleNextButtonOnClick,
    isPrevDisabled,
  } = usePreAssessment();

  const handleModeSelection = (selectedMode: 'checklist' | 'chatbot') => {
    setMode(selectedMode);
  };

  const handleChecklistComplete = async () => {
    try {
      // Get answers from store
      const store = usePreAssessmentChecklistStore.getState();
      const answers = store.answers.flat();

      // In debug mode, we'll simulate results if API call fails
      let preAssessment: any;
      try {
        preAssessment = await service.createPreAssessment({
          answers,
        });
      } catch (error: any) {
        // If API call fails (e.g., no auth), simulate results for testing
        console.warn('API call failed, simulating results:', error);
        preAssessment = {
          scores: {},
          severityLevels: {},
        };
        
        // Generate mock scores based on answers
        const questionnaires = store.questionnaires;
        questionnaires.forEach((qName, qIndex) => {
          const qAnswers = store.answers[qIndex] || [];
          const avgAnswer = qAnswers.length > 0
            ? qAnswers.reduce((sum, a) => sum + a, 0) / qAnswers.length
            : 0;
          const score = Math.round((avgAnswer / 3) * 100); // Assuming 0-3 scale
          const severity = score < 25 ? 'minimal' : score < 50 ? 'mild' : score < 75 ? 'moderate' : 'severe';
          
          preAssessment.scores[qName] = score;
          preAssessment.severityLevels[qName] = severity;
        });
      }

      // Get scores and severity levels
      const scores: Record<string, { score: number; severity: string }> = {};
      const severityLevels: Record<string, string> = {};

      if (preAssessment.scores) {
        Object.entries(preAssessment.scores).forEach(([key, value]) => {
          scores[key] = {
            score: typeof value === 'number' ? value : 0,
            severity: preAssessment.severityLevels?.[key] || 'unknown',
          };
          severityLevels[key] = preAssessment.severityLevels?.[key] || 'unknown';
        });
      }

      setResults({
        method: 'checklist',
        scores,
        severityLevels,
        answers,
        preAssessment,
      });
      setMode('results');
    } catch (error) {
      console.error('Failed to complete checklist assessment:', error);
      alert('Failed to complete assessment. Check console for details.');
    }
  };

  const handleChatbotComplete = async (chatbotResults: {
    scores: Record<string, { score: number; severity: string }>;
    severityLevels: Record<string, string>;
  }) => {
    try {
      // Get conversation insights if available
      let conversationInsights = null;
      const store = usePreAssessmentChecklistStore.getState();
      // Try to get session insights
      try {
        // This would require storing sessionId, but for now we'll skip it
      } catch (e) {
        // Silently fail
      }

      setResults({
        method: 'chatbot',
        scores: chatbotResults.scores,
        severityLevels: chatbotResults.severityLevels,
        conversationInsights,
      });
      setMode('results');
    } catch (error) {
      console.error('Failed to process chatbot results:', error);
      alert('Failed to process results. Check console for details.');
    }
  };

  const handleChatbotCancel = () => {
    setMode('selection');
  };

  const handleReset = () => {
    setMode('selection');
    setResults(null);
    // Reset store
    usePreAssessmentChecklistStore.setState({
      questionnaires: [],
      answers: [],
      step: 0,
      miniStep: 0,
    });
  };

  const getCurrentForm = () => {
    if (mode === 'selection') {
      return (
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TestTube className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">Pre-Assessment Tester</h2>
            </div>
            <p className="text-sm text-gray-600">
              Test the pre-assessment flow without authentication. Choose a method below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => handleModeSelection('checklist')}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle>Checklist Mode</CardTitle>
                </div>
                <CardDescription>
                  Test the traditional checklist questionnaire flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Start Checklist Test
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => handleModeSelection('chatbot')}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <CardTitle>Chatbot Mode</CardTitle>
                </div>
                <CardDescription>
                  Test the AI chatbot assessment flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Start Chatbot Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (mode === 'chatbot') {
      return (
        <ChatbotInterface
          onComplete={handleChatbotComplete}
          onCancel={handleChatbotCancel}
        />
      );
    }

    if (mode === 'results') {
      return <PreAssessmentResults results={results} onReset={handleReset} />;
    }

    // Checklist mode
    if (step === 0) {
      return (
        <PreAssessmentInitialCheckList
          handleNextButtonOnClick={handleNextButtonOnClick}
        />
      );
    } else if (step > 0 && step < questionnaires.length + 1) {
      return (
        <QuestionnaireForm handleNextButtonOnClick={handleNextButtonOnClick} />
      );
    } else if (step === questionnaires.length + 1) {
      // Skip signup, go directly to results
      handleChecklistComplete();
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Processing results...</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full min-h-screen">
      <motion.nav
        variants={fadeDown}
        className="flex items-center justify-between p-4 fixed w-full z-10 bg-gradient-to-b from-tertiary/10 via-transparent to-transparent"
      >
        <Button
          disabled={mode === 'selection' || (mode === 'checklist' && isPrevDisabled)}
          onClick={() => {
            if (mode === 'chatbot' || mode === 'results') {
              handleReset();
            } else {
              handlePrevButtonOnClick();
            }
          }}
          className="rounded-full aspect-square font-bold flex-shrink-0"
          variant="outline"
        >
          <ArrowLeft />
        </Button>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <TestTube className="h-3 w-3 mr-1" />
            DEBUG MODE
          </Badge>
          <div className="w-10" />
        </div>
      </motion.nav>

      <main className="flex flex-col items-center justify-center min-h-screen pt-20 pb-8">
        <motion.div
          variants={fadeDown}
          className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[400px] w-full"
        >
          {mode === 'checklist' && <PreAssessmentProgressBar />}

          <div className="w-full">
            <motion.div animate={animationControls} variants={fadeDown}>
              {getCurrentForm()}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

